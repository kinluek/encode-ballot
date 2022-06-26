import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { getWallet } from "../../lib/wallet";

async function main() {
  const wallet = getWallet();
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  if (process.argv.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = process.argv[2];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  let i = 0;
  let moreProposals = true;
  while (moreProposals) {
    try {
      const prop = await ballotContract.proposals(i);
      const propName = ethers.utils.parseBytes32String(prop.name);
      console.log(`Proposal No. ${i + 1}: ${propName}`);
      i++;
    } catch (err) {
      moreProposals = false;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
