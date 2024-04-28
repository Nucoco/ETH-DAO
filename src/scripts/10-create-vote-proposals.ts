import { ethers } from 'ethers';

import sdk from './1-initialize-sdk';
import { ERCTokenAddress, governanceAddress, ownerWalletAddress } from './module';


(async () => {
  const vote = await sdk.getContract(governanceAddress, 'vote');
  const token = await sdk.getContract(ERCTokenAddress, 'token');
  const voteAddress = vote.getAddress();
  const tokenAddress = token.getAddress();

  // トレジャリーに 420,000 のトークンを新規発行する提案
  try {
    const amount = 420_000;
    const exaAmount = ethers.utils.parseUnits(amount.toString(), 18)
    const description = `Should the DAO mint an additional ${amount} tokens into the treasury?`;
    const executions = [{
        // mint を実行するトークンのアドレスを設定します
        toAddress: token.getAddress(),
        // プロポーザル作成時に送信するネイティブトークン(ETH)の量を設定します
        nativeTokenValue: 0,
        // ガバナンスコントラクトのアドレスに mint する
        transactionData: token.encoder.encode('mintTo', [voteAddress, exaAmount]),
    }];
    await vote.propose(description, executions);
    console.log('✅ Successfully created proposal to mint tokens');
  } catch (error) {
    console.error('failed to create first proposal', error);
  }

  // 6,900 のトークンを自分たちに配布するための提案を作成します
  try {
    const amount = 6_900;
    const exaAmount = ethers.utils.parseUnits(amount.toString(), 18)
    const description = `Should the DAO transfer ${amount} tokens from the treasury to ${ownerWalletAddress} for being awesome?`;
    const executions = [{
        nativeTokenValue: 0,
        // トレジャリーからウォレットへの送金
        transactionData: token.encoder.encode('transfer', [ownerWalletAddress, exaAmount]),
        toAddress: tokenAddress,
    }];
    await vote.propose(description, executions);
    console.log("✅ Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!");
  } catch (error) {
    console.error('failed to create second proposal', error);
  }
})();