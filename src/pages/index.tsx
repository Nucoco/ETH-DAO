import { Sepolia } from '@thirdweb-dev/chains';
import {
  ConnectWallet,
  useAddress,
  useChain,
  useContract,
} from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';

import styles from '../styles/Home.module.css';

const basicMemberTokenId = 0

const Home: NextPage = () => {
  const address = useAddress();
  console.log('👋Wallet Address: ', address);

  const chain = useChain();

  // コントラクトを初期化
  const erc1155 = useContract(
    '0xAf8990ABe1E6857C4DCD0cf5dF486fE276799Cc6',
    'edition-drop',
  ).contract;

  // トークンコントラクトの初期化
  const erc20 = useContract(
    '0xA9ED9DCF7941c499338a3d83e50133F90870AE67',
    'token',
  ).contract;

  // ユーザーがメンバーシップ NFT を持っているかどうかを知るためのステートを定義
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFT をミンティングしている間を表すステートを定義
  const [isClaiming, setIsClaiming] = useState(false);
  // メンバーごとの保有しているトークンの数をステートとして宣言
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);

  // DAO メンバーのアドレスをステートで宣言
  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  // アドレスの長さを省略してくれる便利な関数
  const shortenAddress = (str: string) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  // メンバーシップを保持しているメンバーの全アドレスを取得します
  const getAllAddresses = () => {
    if (!hasClaimedNFT) {
      return;
    }

    // 先ほどエアドロップしたユーザーがここで取得できます（発行された tokenID 0 のメンバーシップ NFT）
    (async () => {
      try {
        const memberAddresses = await erc1155?.history.getAllClaimerAddresses(
          0
        );
        setMemberAddresses(memberAddresses);
        console.log('🚀 Members addresses', memberAddresses);
      } catch (error) {
        console.error('failed to get member list', error);
      }
    })();
  }

  // 各メンバーが保持するトークンの数を取得します
  const getAllBalances = () => {
    if (!hasClaimedNFT) {
      return;
    }

    (async () => {
      try {
        const amounts = await erc20?.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log('👜 Amounts', amounts);
      } catch (error) {
        console.error('failed to get member balances', error);
      }
    })();
  }

  const checkIsMember = () => {
    if (!address) {
      return;
    }

    (async () => {
      try {
        const balance = await erc1155!.balanceOf(address, basicMemberTokenId);
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
    })();
  }

  useEffect(getAllAddresses, [hasClaimedNFT, erc1155?.history]);
  useEffect(getAllBalances, [hasClaimedNFT, erc20?.history]);
  useEffect(checkIsMember, [address, erc1155]);

  // memberAddresses と memberTokenAmounts を 1 つの配列に結合します
  const memberList = useMemo(() => {
    return memberAddresses?.map((address) => {
      // memberTokenAmounts 配列でアドレスが見つかっているかどうかを確認します
      // その場合、ユーザーが持っているトークンの量を返します
      // それ以外の場合は 0 を返します
      const member = memberTokenAmounts?.find(
        ({ holder }: {holder: string}) => holder === address,
      );

      return {
        address,
        tokenAmount: member?.balance.displayValue || '0',
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await erc1155!.claim(String(basicMemberTokenId), 1);
      console.log(`🌊 Successfully Minted! Check it out on etherscan: https://sepolia.etherscan.io/address/${erc1155!.getAddress()}`);
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
          <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList!.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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