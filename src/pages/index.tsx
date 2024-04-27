import { Sepolia } from '@thirdweb-dev/chains';
import {
  ConnectWallet,
  useAddress,
  useChain,
  useContract,
} from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import styles from '../styles/Home.module.css';

const basicMemberTokenId = 0

const Home: NextPage = () => {
  const address = useAddress();
  console.log('👋Wallet Address: ', address);

  const chain = useChain();

  // コントラクトを初期化
  const editionDrop = useContract(
    '0xAf8990ABe1E6857C4DCD0cf5dF486fE276799Cc6',
    'edition-drop',
  ).contract;

  // ユーザーがメンバーシップ NFT を持っているかどうかを知るためのステートを定義
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFT をミンティングしている間を表すステートを定義
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
        if (!address) {
      return;
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop!.balanceOf(address, basicMemberTokenId);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log('🌟 this user has a membership NFT!');
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error('Failed to get balance', error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop!.claim(String(basicMemberTokenId), 1);
      console.log(`🌊 Successfully Minted! Check it out on etherscan: https://sepolia.etherscan.io/address/${editionDrop!.getAddress()}`);
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error('Failed to mint NFT', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const isNotSepolia = () => {
    return chain && chain.chainId !== Sepolia.chainId
  }

  const forNotConnected = () => {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Welcome to Tokyo Sauna Collective !!
          </h1>
          <br></br>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }

  const forNotSepolia = () => {
    console.log('wallet address: ', address);
    console.log('chain name: ', chain?.name);

    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Sepolia に切り替えてください⚠️</h1>
          <p>この dApp は Sepolia テストネットのみで動作します。</p>
          <p>ウォレットから接続中のネットワークを切り替えてください。</p>
        </main>
      </div>
    );
  }

  const forMember = () => {
    return (
      <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>
      </main>
    </div>
    );
  }

  const forNotMember = () => {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Mint your free 🍪DAO Membership NFT</h1>
          <button disabled={isClaiming} onClick={mintNft}>
            {isClaiming ? 'Minting...' : 'Mint your nft (FREE)'}
          </button>
        </main>
      </div>
    );
  }
  // ウォレットと接続していなかったら接続を促す
  if (!address) {
    return forNotConnected()
  }
  else {
    if (isNotSepolia()) {
      return forNotSepolia()
    } else {
      if (hasClaimedNFT){
        return forMember()
      } else {
        return forNotMember()
      }
    }
  }
};

export default Home;