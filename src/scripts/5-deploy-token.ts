import { AddressZero } from '@ethersproject/constants';

import sdk from './1-initialize-sdk';

const tokenData = {
  name: 'Tokyo Sauna Collective Governance Token',
  symbol: 'TSC',
  // これは、トークンを売却する場合の受け取り先の設定
  // 今回は販売しないので、再び AddressZero に設定
  primary_sale_recipient: AddressZero,
};

(async () => {
  try {
    // 標準的なERC-20のコントラクトをデプロイする
    const tokenAddress = await sdk.deployer.deployToken(tokenData);
    console.log('✅ Successfully deployed token module, address:', tokenAddress);
  } catch (error) {
    console.error('failed to deploy token module', error);
  }
})();