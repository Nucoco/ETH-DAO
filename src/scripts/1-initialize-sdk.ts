import nextEnv from '@next/env';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

const { loadEnvConfig } = nextEnv;
const { PRIVATE_KEY, CLIENT_ID, SECRET_KEY } = loadEnvConfig(
  process.cwd(),
).combinedEnv;

// 環境変数が取得できているか確認
if (!PRIVATE_KEY || PRIVATE_KEY === '') {
  console.log('🛑 Private key not found.');
}

if (!CLIENT_ID || CLIENT_ID === '') {
  console.log('🛑 Client ID of API Key not found.');
}

if (!SECRET_KEY || SECRET_KEY === '') {
  console.log('🛑 Secret Key of API Key not found.');
}

// sdk initialization
const sdk = ThirdwebSDK.fromPrivateKey(PRIVATE_KEY!, 'sepolia', {
  clientId: CLIENT_ID,
  secretKey: SECRET_KEY,
});
(async () => {
  try {
    if (!sdk || !('getSigner' in sdk)) return;
    const address = await sdk.getSigner()?.getAddress();
    console.log('SDK initialized by address:', address);
  } catch (err) {
    console.error('Failed to get apps from the sdk', err);
    process.exit(1);
  }
})();

export default sdk;