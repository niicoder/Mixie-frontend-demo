import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Axios from 'axios';

import './style.scss';

type ISingleNFT = {
  ownerAddress: string;
  index: number;
  contract: ethers.Contract;
};

type INFTData = {
  tokenInfo: any;
  tokenId: number;
};

const TOKEN_URI_BASE = 'https://api.chainguardians.io/api/opensea';

const SingleNFT: FC<ISingleNFT> = ({ index = 0, contract, ownerAddress }): ReactElement => {
  const [nftData, setNFTData] = useState<INFTData>(null);

  const handleLoadData = useCallback(async () => {
    setNFTData(null);

    const tokenId = (await contract.tokenOfOwnerByIndex(ownerAddress, index)).toNumber();

    try {
      const tokenInfoRes = await Axios.get(`${TOKEN_URI_BASE}/200`); // Need to put tokenid

      setNFTData({ tokenId, tokenInfo: tokenInfoRes.data });
    } catch (error) {
      console.error('onLoadTokenInfo', error);
      setNFTData({ tokenId, tokenInfo: null });
    }
  }, [ownerAddress, contract, index]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <div className="single-nft">
      <div className="nft-image">
        <img
          src={
            !nftData || !nftData?.tokenInfo?.image
              ? 'https://miro.medium.com/max/441/1*9EBHIOzhE1XfMYoKz1JcsQ.gif'
              : nftData.tokenInfo.image
          }
          alt="nft-img"
        />
      </div>
      <div className="nft-descriptions">
        <p className="name">TokenId: {nftData?.tokenId}</p>
        {nftData?.tokenInfo && (
          <div>
            <p>{index}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleNFT;
