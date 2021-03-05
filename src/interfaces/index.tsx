import { ethers } from 'ethers';

export type IAppProps = {
  title?: string;
};

export type IAccountData = {
  provider: ethers.providers.Provider;
  signer: ethers.providers.JsonRpcSigner;
  account: string;
  chainId: string;
};

export type IContracts = {
  mixContract: ethers.Contract | null;
  mixieContract: ethers.Contract | null;
  distContract: ethers.Contract | null;
};

export type IBalances = {
  mix: number;
  isApproved: boolean;
  requiredMix: number;
  mixie: number;
};
