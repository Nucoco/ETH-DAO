import sdk from './1-initialize-sdk';
import { ERCTokenAddress } from './module';

(async () => {
  try {
    const token = await sdk.getContract(ERCTokenAddress, 'token');
    // 現在のロールを記録します
    const allRoles = await token.roles.getAll();
    console.log('👀 Roles that exist right now:', allRoles);

    // ERC-20 のコントラクトに関して、あなたのウォレットが持っている権限をすべて取り消します
    await token.roles.setAll({ admin: [], minter: [] });
    console.log('🎉 Roles after revoking ourselves', await token.roles.getAll());
    console.log('✅ Successfully revoked our superpowers from the ERC-20 contract');
  } catch (error) {
    console.error('Failed to revoke ourselves from the DAO treasury', error);
  }
})();
