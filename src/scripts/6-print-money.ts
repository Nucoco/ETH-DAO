import sdk from './1-initialize-sdk';
import { ERCTokenAddress } from './module';

const token = sdk.getContract(ERCTokenAddress, 'token');

(async () => {
  try {
    // 最大供給量を設定
    const amount = 1000000;
    // デプロイされた ERC-20 コントラクトを通して、トークンをミント
    await (await token).mint(amount);
    const totalSupply = await (await token).totalSupply();

    console.log('✅ There now is', totalSupply.displayValue, '$TSC in circulation');
  } catch (error) {
    console.error('Failed to print money', error);
  }
})();
