import { Contract, ethers, BigNumber } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
import { getWallet } from "../../lib/wallet";

async function main() {
  const wallet = getWallet();
  console.log(`Using address ${wallet.address}`);
  const provider = new ethers.providers.InfuraProvider(
    "ropsten",
    process.env.ROPSTEN_URL
  );
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether to perform these transaction");
  }
  if (process.argv.length < 3) throw new Error("Ballot address is missing");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4) throw new Error("Proposal number is missing");
  const proposal = BigNumber.from(process.argv[3]);
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  console.log(
    `Cast a vote to proposal ${proposal.toString()} for Wallet ${
      wallet.address
    }`
  );
  const tx = await ballotContract.vote(proposal);
  console.log("Awaiting for confirmations");
  await tx.wait();
  console.log(`Transaction completed. TX Hash is : ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
