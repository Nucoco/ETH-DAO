import { MaxUint256 } from '@ethersproject/constants';

import sdk from './1-initialize-sdk';
import { editionDropAddress } from './module';

const editionDrop = sdk.getContract(editionDropAddress, 'edition-drop');

// オブジェクトの配列を渡すことで、条件を設定できます
// 必要であれば、複数の条件をそれぞれ異なる時期に設定することもできます
// FYI: https://docs.thirdweb.com/typescript/sdk.tokendrop.claimconditions#tokendropclaimconditions-property
const claimConditions = [
  {
    // NFTミント開始日
    startTime: new Date(),
    // 最大供給量
    maxQuantity: 50_000,
    // 価格
    price: 0,
    // 一回当たりの最大ミント個数
    quantityLimitPerTransaction: 1,
    // トランザクション間の待ち時間
    // MaxUint256 に設定し、1人1回しか請求できないように設定
    waitInSeconds: MaxUint256,
  },
];

(async () => {
  try {
    // ERC1155 は複数の人が同じtokenIdのNFTを保持し、同じ人が異なるtokenIdの複数のNFTを保持することもできる。
    // tokenId毎に用途・効果を分けることが出来る。
    const targetTokenId = 0;
    await (await editionDrop).claimConditions.set(String(targetTokenId), claimConditions);
    console.log('✅ Successfully set claim condition!');
  } catch (error) {
    console.error('Failed to set claim condition', error);
  }
})();
