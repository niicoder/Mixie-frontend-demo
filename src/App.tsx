import React, { FC, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

import './styles/app.scss';
import { IAccountData, IAppProps, IBalances, IContracts } from './interfaces';
import { Button } from './components/ui';

import distJson from './contracts/distributor.json';
import mixJson from './contracts/mix.json';
import mixieJson from './contracts/mixie.json';
import SingleNFT from './components/SingleNFT';

declare const window: any;

const App: FC<IAppProps> = ({ title = 'Mixie Distribution Demo' }): ReactElement => {
  const [accountData, setAccountData] = useState<IAccountData | null>(null);

  const [contracts, setContracts] = useState<IContracts | null>(null);
  const [balances, setBalances] = useState<IBalances | null>(null);
  const [minting, setMinting] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);

  const chainString = useMemo(() => {
    switch (accountData?.chainId) {
      case '0x1':
        return 'Mainnet';
      case '0x4':
        return 'Rinkeby';
      case '0x61':
        return 'BSC Test';
      default:
        return '';
    }
  }, [accountData?.chainId]);

  const handleChangeAccounts = async () => {
    setAccountData(null);

    const { chainId } = window.ethereum;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const account = await signer.getAddress();

    setAccountData({
      provider,
      signer,
      account,
      chainId,
    });
  };

  useEffect(() => {
    const { ethereum } = window;

    if (typeof ethereum !== 'undefined') {
      (async () => {
        ethereum.on('accountsChanged', handleChangeAccounts);

        ethereum.on('chainChanged', (/* chainId */) => {
          window.location.reload();
        });
      })();
    }
  }, []);

  const chainIndex = useMemo(() => {
    if (!accountData) return 0;

    const { chainId } = accountData;

    switch (chainId) {
      case '0x61':
        return 1;
      case '0x38':
        return 0;
      case '0x4':
        return 2;
      default:
        return 3;
    }
  }, [accountData]);

  useEffect(() => {
    if (!accountData) return;

    const { signer } = accountData;

    setContracts(null);

    const mixContract = new ethers.Contract(mixJson.address[chainIndex], mixJson.abi, signer);
    const mixieContract = new ethers.Contract(mixieJson.address[chainIndex], mixieJson.abi, signer);
    const distContract = new ethers.Contract(distJson.address[chainIndex], distJson.abi, signer);

    setContracts({ mixContract, mixieContract, distContract });
  }, [accountData, chainIndex]);

  const handleGetBalances = useCallback(async () => {
    setBalances(null);

    const mixBalances = await contracts.mixContract.balanceOf(accountData?.account);
    const mixieBalances = await contracts.mixieContract.balanceOf(accountData?.account);
    const requiredMix = await contracts.distContract.getRequiredMix();

    const approved = await contracts.mixContract.allowance(accountData.account, contracts.distContract.address);

    setBalances({
      mixie: mixieBalances.toNumber(),
      mix: parseFloat(ethers.utils.formatEther(mixBalances)),
      isApproved: approved.gte(requiredMix),
      requiredMix: parseFloat(ethers.utils.formatEther(requiredMix)),
    });
  }, [accountData, contracts]);

  useEffect(() => {
    if (!contracts || !accountData) return;
    handleGetBalances();
  }, [contracts, accountData, handleGetBalances]);

  const onConnectWallet = () => {
    const { ethereum } = window;
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleChangeAccounts)
      .catch((err: { code: number }) => {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  };

  const onMint = async () => {
    setMinting(true);

    try {
      const tx = await contracts.distContract.getNFT();
      await tx.wait();

      alert('You got new NFT!');

      setMinting(false);
      handleGetBalances();
    } catch (error) {
      alert('Failed');
      setMinting(false);
    }
  };

  const onApprove = async () => {
    setApproving(true);

    try {
      const tx = await contracts.mixContract.approve(contracts.distContract.address, ethers.constants.MaxUint256);
      await tx.wait();

      alert('Approved!');

      setApproving(false);
      setBalances({ ...balances, isApproved: true });
    } catch (error) {
      alert('Approve Failed');
      setApproving(false);
    }
  };

  return (
    <div className="mixie-demo-container">
      <p className="demo-title">{title}</p>
      <div className="actions">
        {!accountData?.account && <Button onClick={onConnectWallet}>Connect Wallet</Button>}
        {contracts &&
          balances &&
          (balances.isApproved ? (
            <Button onClick={onMint} loading={minting}>
              Get NFT
            </Button>
          ) : (
            <Button onClick={onApprove} loading={approving}>
              Approve
            </Button>
          ))}
      </div>
      <div className="informations">
        {accountData && (
          <div className="address">
            Your address ({chainString}): {accountData?.account}
          </div>
        )}
        <div className="mix-balance">Your Mix Balance: {balances?.mix}</div>
        <div className="mix-balance">Your Mixie Balance: {balances?.mixie}</div>
        <div className="required-mix">Required Mix: {balances?.requiredMix}</div>
      </div>
      {balances && balances.mixie > 0 && (
        <div className="owned-nfts">
          {[...Array(balances.mixie)].map((value, index) => {
            return (
              <SingleNFT
                ownerAddress={accountData?.account}
                index={index}
                key={index}
                contract={contracts.mixieContract}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default App;
