import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
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
  if (process.argv.length < 3)
    throw new Error("Provide a valid ballot contract addess");
  const ballotAddress = process.argv[2];
  if (process.argv.length < 4)
    throw new Error("Provide a valid delegate address");
  const delegateAddress = process.argv[3];
  console.log(`Delegating a vote to ${delegateAddress}`);
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  const txn = await ballotContract.delegate(delegateAddress);
  console.log("confirmation in process...");
  await txn.wait();
  console.log(`Transaction was completed. Hash: ${txn.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
