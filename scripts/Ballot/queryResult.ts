import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
import { Ballot } from "../../typechain";
import { getInfuraProvider, getWallet } from "../../lib/config";

async function main() {
  const wallet = getWallet();
  console.log(`Using address ${wallet.address}`);
  const provider = getInfuraProvider("ropsten");
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

  const winningName = await ballotContract.winnerName();
  console.log(
    `Winning proposal: ${ethers.utils.parseBytes32String(winningName)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
