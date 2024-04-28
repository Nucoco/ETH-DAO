import sdk from './1-initialize-sdk';
import { ERCTokenAddress, governanceAddress, ownerWalletAddress } from './module';

(async () => {
  const vote = await sdk.getContract(governanceAddress, 'vote');
  const token = await sdk.getContract(ERCTokenAddress, 'token');
  const treasuryAddress = vote.getAddress();

  try {
    // 必要に応じて追加のトークンを作成する権限をトレジャリーに与えます
    await token.roles.grant('minter', treasuryAddress);
    console.log('Successfully gave vote contract permissions to act on token contract');
  } catch (error) {
    console.error('failed to grant vote contract permissions on token contract', error);
  }

  // ガバナンストークン発行者の90%の残高をガバナンスコントラクトに移動する
  try {
    const tokenBalance = (await token.balanceOf(ownerWalletAddress)).displayValue;
    const percent90 = 0.9 * Number(tokenBalance);

    // 供給量の 90% をガバナンスコントラクトへ移動します
    await token.transfer(treasuryAddress, percent90);
    console.log('✅ Successfully transferred ' + percent90 + ' tokens to vote contract');
  } catch (err) {
    console.error('failed to transfer tokens to vote contract', err);
  }
})();