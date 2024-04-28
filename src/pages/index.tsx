import { Sepolia } from '@thirdweb-dev/chains';
import { Proposal } from '@thirdweb-dev/sdk';
import {
  ConnectWallet,
  useAddress,
  useChain,
  useContract,
} from '@thirdweb-dev/react';
import { AddressZero } from '@ethersproject/constants';
import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';

import styles from '../styles/Home.module.css';

const basicMemberTokenId = 0

const Home: NextPage = () => {
  const address = useAddress()!;
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

  // 投票コントラクトの初期化
  const vote = useContract(
    '0x29d2d3b4137Ee3E11e17aE27a30360675a3d8Fa9',
    'vote',
  ).contract;

  // ユーザーがメンバーシップ NFT を持っているかどうかを知るためのステートを定義
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);

  // NFT をミンティングしている間を表すステートを定義
  const [isClaiming, setIsClaiming] = useState(false);
  // メンバーごとの保有しているトークンの数をステートとして宣言
  const [memberTokenAmounts, setMemberTokenAmounts] = useState<any>([]);

  // DAO メンバーのアドレスをステートで宣言
  const [memberAddresses, setMemberAddresses] = useState<string[] | undefined>([]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // アドレスの長さを省略してくれる便利な関数
  const shortenAddress = (str: string) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  // コントラクトから既存の提案を全て取得します
  const getAllProposals = () => {
    if (!hasClaimedNFT) {
      return;
    }

    // vote!.getAll() を使用して提案を取得します
    (async () => {
      try {
        const proposals = await vote!.getAll();
        setProposals(proposals);
        console.log('🌈 Proposals:', proposals);
      } catch (error) {
        console.log('failed to get proposals', error);
      }
    })();
  }

  // ユーザーがすでに投票したかどうか確認します
  const checkIfUserHasVoted = () => {
    if (!hasClaimedNFT) {
      return;
    }
    // 提案を取得し終えない限り、ユーザーが投票したかどうかを確認することができない
    if (!proposals.length) {
      return;
    }
    (async () => {
      try {
        const hasVoted = await vote!.hasVoted(proposals[0].proposalId.toString(), address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log('🥵 User has already voted');
        } else {
          console.log('🙂 User has not voted yet');
        }
      } catch (error) {
        console.error('Failed to check if wallet has voted', error);
      }
    })();
  }

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
  useEffect(checkIfUserHasVoted, [hasClaimedNFT, proposals, address, vote]);
  useEffect(getAllProposals, [hasClaimedNFT, vote]);

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
              <h2>■ Member List</h2>
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
            <div>
              <h2>■ Active Proposals</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // ダブルクリックを防ぐためにボタンを無効化します
                  setIsVoting(true);

                  // フォームから値を取得します
                  const votes = proposals.map((proposal) => {
                    const voteResult = {
                      proposalId: proposal.proposalId,
                      vote: 2,
                    };
                    proposal.votes.forEach((vote) => {
                      const elem = document.getElementById(
                        proposal.proposalId + '-' + vote.type
                      ) as HTMLInputElement;

                      if (elem!.checked) {
                        voteResult.vote = vote.type;
                        return;
                      }
                    });
                    return voteResult;
                  });

                  // ユーザーが自分のトークンを投票に委ねることを確認する必要があります
                  try {
                    // 投票する前にウォレットがトークンを委譲する必要があるかどうかを確認します
                    const delegation = await erc20!.getDelegationOf(address);
                    // トークンを委譲していない場合は、投票前に委譲します
                    if (delegation === AddressZero) {
                      await erc20!.delegateTo(address);
                    }
                    // 提案に対する投票を行います
                    try {
                      await Promise.all(
                        votes.map(async ({ proposalId, vote: _vote }) => {
                          // 提案に投票可能かどうかを確認します
                          const proposal = await vote!.get(proposalId);
                          // 提案が投票を受け付けているかどうかを確認します
                          if (proposal.state === 1) {
                            return vote!.vote(proposalId.toString(), _vote);
                          }
                          return;
                        })
                      );
                      try {
                        // 提案が実行可能であれば実行する
                        await Promise.all(
                          votes.map(async ({ proposalId }) => {
                            const proposal = await vote!.get(proposalId);

                            // state が 4 の場合は実行可能と判断する
                            if (proposal.state === 4) {
                              return vote!.execute(proposalId.toString());
                            }
                          })
                        );
                        // 投票成功と判定する
                        setHasVoted(true);
                        console.log('successfully voted');
                      } catch (err) {
                        console.error('failed to execute votes', err);
                      }
                    } catch (err) {
                      console.error('failed to vote', err);
                    }
                  } catch (err) {
                    console.error('failed to delegate tokens');
                  } finally {
                    setIsVoting(false);
                  }
                }}
              >
                {proposals.map((proposal) => (
                  <div key={proposal.proposalId.toString()} className="card">
                    <h5>{proposal.description}</h5>
                    <div>
                      {proposal.votes.map(({ type, label }) => (
                        <div key={type}>
                          <input
                            type="radio"
                            id={proposal.proposalId + '-' + type}
                            name={proposal.proposalId.toString()}
                            value={type}
                            // デフォルトで棄権票をチェックする
                            defaultChecked={type === 2}
                          />
                          <label htmlFor={proposal.proposalId + '-' + type}>
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p></p>
                <button disabled={isVoting || hasVoted} type="submit">
                  {isVoting
                    ? 'Voting...'
                    : hasVoted
                      ? 'You Already Voted'
                      : 'Submit Votes'}
                </button>
                <p></p>
                {!hasVoted && (
                  <small>
                    This will trigger multiple transactions that you will need to
                    sign.
                  </small>
                )}
              </form>
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