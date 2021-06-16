import { useEffect, useState } from 'react';

import { CognitoUser, CognitoUserPool } from '../cognito';

const {
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_CLIENT_ID: ClientId
} = process.env;

/**
 * @category Hooks
 */
export function useCognitoUser(): CognitoUser | undefined {
  const [cognitoUser, setCognitoUser] = useState<CognitoUser>();

  useEffect(() => {
    async function getCognitoUser() {
      if (!UserPoolId || !ClientId)
        throw new Error('Configuration error: userPoolId missing during getCognitoUser.');
  
      const pool = new CognitoUserPool({ UserPoolId, ClientId });
      const user = pool.getCurrentUser();
  
      if (!user)
        return undefined;
  
      await user.getSession();

      setCognitoUser(user)
    }
    void getCognitoUser();
  }, [])

  return cognitoUser;
}