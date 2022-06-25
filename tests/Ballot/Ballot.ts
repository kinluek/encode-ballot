import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import { Ballot } from "../../typechain";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

async function vote(
  ballotContract: Ballot,
  voterAccount: Signer,
  proposal: number
) {
  const tx = await ballotContract.connect(voterAccount).vote(proposal);
  await tx.wait();
}

async function delegate(
  ballotContract: Ballot,
  delegator: SignerWithAddress,
  delegatee: SignerWithAddress
) {
  const tx = await ballotContract
    .connect(delegator)
    .delegate(delegatee.address);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: SignerWithAddress[];

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("when the voter interact with the vote function in the contract", function () {
    it("voter should not be able to vote if they have no right", async function () {
      const voter = accounts[1];
      await expect(vote(ballotContract, voter, 0)).to.be.revertedWith(
        "Has no right to vote"
      );
    });

    it("voter should should be able to vote if they have been given the right", async function () {
      const voter = accounts[1];
      await giveRightToVote(ballotContract, voter.address);
      await vote(ballotContract, voter, 0);
      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(BigNumber.from(1));
    });

    it("voter should not be able to vote twice", async function () {
      const voter = accounts[1];
      await giveRightToVote(ballotContract, voter.address);
      await vote(ballotContract, voter, 0);
      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(BigNumber.from(1));
      await expect(vote(ballotContract, voter, 0)).to.be.revertedWith(
        "Already voted."
      );
    });

    it("voter should be able to apply delegated weight to vote", async function () {
      const voter = accounts[1];
      const delegator = accounts[2];
      await giveRightToVote(ballotContract, voter.address);
      await giveRightToVote(ballotContract, delegator.address);
      await delegate(ballotContract, delegator, voter);
      await vote(ballotContract, voter, 0);
      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(BigNumber.from(2));
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("voter should not be able to delegate if they have no right to vote", async function () {
      const delegator = accounts[1];
      const delegatee = accounts[2];
      await giveRightToVote(ballotContract, delegatee.address);
      await expect(
        delegate(ballotContract, delegator, delegatee)
      ).to.be.revertedWith("You must have the right to vote.");
    });

    it("voter should not be able to delegate to voter who has no right to vote", async function () {
      const delegator = accounts[1];
      const delegatee = accounts[2];
      await giveRightToVote(ballotContract, delegator.address);
      await expect(
        delegate(ballotContract, delegator, delegatee)
      ).to.be.revertedWith("");
    });

    it("voter should not be able to delegate if they have already voted", async function () {
      const delegator = accounts[1];
      const delegatee = accounts[2];
      await giveRightToVote(ballotContract, delegator.address);
      await giveRightToVote(ballotContract, delegatee.address);
      await vote(ballotContract, delegator, 0);
      await expect(
        delegate(ballotContract, delegator, delegatee)
      ).to.be.revertedWith("You already voted.");
    });

    it("voter should not be able to delegate to themselves", async function () {
      const delegator = accounts[1];
      await giveRightToVote(ballotContract, delegator.address);
      await expect(
        delegate(ballotContract, delegator, delegator)
      ).to.be.revertedWith("Self-delegation is disallowed.");
    });

    it("voter should be able to delegate to voter who has right to vote", async function () {
      const delegator = accounts[1];
      const delegatee = accounts[2];
      await giveRightToVote(ballotContract, delegator.address);
      await giveRightToVote(ballotContract, delegatee.address);
      await delegate(ballotContract, delegator, delegatee);
      const delegateeVoter = await ballotContract.voters(delegatee.address);
      expect(delegateeVoter.weight).to.equal(BigNumber.from(2));
    });

    it("voters delegation should follow the delegation path", async function () {
      const delegator = accounts[1];
      const delegatee1 = accounts[2];
      const delegatee2 = accounts[3];
      await giveRightToVote(ballotContract, delegator.address);
      await giveRightToVote(ballotContract, delegatee1.address);
      await giveRightToVote(ballotContract, delegatee2.address);
      await delegate(ballotContract, delegatee1, delegatee2);
      await delegate(ballotContract, delegator, delegatee1);
      const delegatorVoter = await ballotContract.voters(delegator.address);
      expect(delegatorVoter.delegate).to.equal(delegatee2.address);
      const delegatee2Voter = await ballotContract.voters(delegatee2.address);
      expect(delegatee2Voter.weight).to.equal(BigNumber.from(3));
    });

    it("voters delegation should add to the proposal count if delegatee has voted for it", async function () {
      const delegator = accounts[1];
      const delegatee = accounts[2];
      await giveRightToVote(ballotContract, delegator.address);
      await giveRightToVote(ballotContract, delegatee.address);
      await vote(ballotContract, delegatee, 0);
      let proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(BigNumber.from(1));
      await delegate(ballotContract, delegator, delegatee);
      proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(BigNumber.from(2));
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // TODO
    it("is not implemented", async function () {
      throw new Error("Not implemented");
    });
  });
});
