import { ethers } from "ethers";

export function getWallet(): ethers.Wallet {
  if (process.env.MNEMONIC) {
    return ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  }
  if (process.env.PRIVATE_KEY) {
    return new ethers.Wallet(process.env.PRIVATE_KEY);
  }
  throw new Error(
    "MNEMONIC or PRIVATE_KEY environment variable must be set to initialize wallet"
  );
}
