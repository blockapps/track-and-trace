import { assert } from 'chai';
import oauthHelper from '../../helpers/oauth';
import { get, post } from '../helpers/rest';
import endpoints from '../../api/v1/endpoints';

const createUser = async function (userToken, adminToken, role) {
  try {
    const user = await get(endpoints.Users.me, userToken.token);
    assert.equal(user.role, role, 'user already created with different role');
  } catch (err) {
    console.log(err);
    const userEmail = oauthHelper.getEmailIdFromToken(userToken.token);
    const createAccountResponse = await oauthHelper.createStratoUser(userToken, userEmail);
    const createTtUserArgs = {
      account: createAccountResponse.user.address,
      username: userEmail,
      role: role
    };
    await post(endpoints.Users.users, createTtUserArgs, adminToken.token);
  }
}

export default { createUser };