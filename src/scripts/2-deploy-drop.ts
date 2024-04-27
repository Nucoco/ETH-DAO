import { AddressZero } from '@ethersproject/constants';
import { readFileSync } from 'fs';

import sdk from './1-initialize-sdk';

(async () => {
  try {
    const editionDropAddress = await sdk.deployer.deployEditionDrop({
      name: 'Tokyo Sauna Collective',
      description: 'A DAO for sauna enthusiasts in Tokyo',
      image: readFileSync('src/scripts/assets/comp.png'),
      // NFT の販売による収益を受け取るアドレスを設定
      // ドロップに課金をしたい場合は、ここに自分のウォレットアドレスを設定します
      // 今回は課金設定はないので、0x0 のアドレスで渡す
      primary_sale_recipient: AddressZero,
    });

    // 初期化し、返ってきた editionDrop コントラクトのアドレスから editionDrop を取得
    const editionDrop = sdk.getContract(editionDropAddress, 'edition-drop');

    // メタデータを取得
    const metadata = await (await editionDrop).metadata.get();

    // editionDrop コントラクトのアドレスを出力
    console.log(
      '✅ Successfully deployed editionDrop contract, address:',
      editionDropAddress
    );

    // editionDrop コントラクトのメタデータを出力
    console.log('✅ editionDrop metadata:', metadata);
  } catch (error) {
    console.log('failed to deploy editionDrop contract', error);
  }
})();