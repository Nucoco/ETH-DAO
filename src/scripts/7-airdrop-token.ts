import sdk from './1-initialize-sdk';
import { editionDropAddress, ERCTokenAddress } from './module';

const editionDrop = sdk.getContract(editionDropAddress, 'edition-drop');
const token = sdk.getContract(ERCTokenAddress, 'token');

(async () => {
  try {
    // メンバーシップ NFT を所有している人のアドレスをすべて取得
    const basicMemberTokenId = 0;
    const walletAddresses = await (await editionDrop).history.getAllClaimerAddresses(basicMemberTokenId);

    if (walletAddresses.length === 0) {
      console.log('No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!');
    }

    // airDrop(1000~10000)
    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log('✅ Going to airdrop', randomAmount, 'tokens to', address);

      const airdropTarget = {
        toAddress: address,
        amount: randomAmount,
      };

      return airdropTarget;
    });
    // 全てのエアドロップ先で transferBatch を呼び出す
    console.log('🌈 Starting airdrop...');
    await (await token).transferBatch(airdropTargets);
    console.log('✅ Successfully airdropped tokens to all the holders of the NFT!');
  } catch (err) {
    console.error('Failed to airdrop tokens', err);
  }
})();