import { useEffect, useState } from 'react';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";

import { CognitoUser, CognitoUserPool, ILoginActionTypes } from 'awayto';
import { useAct } from 'awayto-hooks';

const {
  REACT_APP_AWS_REGION: Region,
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_CLIENT_ID: ClientId,
  REACT_APP_COGNITO_IDENTITY_POOL_ID: IdentityPoolId
} = process.env as { [prop: string]: string };

const { AUTH_SUCCESS, AUTH_DENIAL } = ILoginActionTypes;

/**
 * Use this hook to get access to cognito functionality once the user has logged in, or to check if the user is logged in.
 * 
 * ```
 * import { useCognitoUser } from 'awayto';
 * 
 * const cognitoUser = useCognitoUser();
 * 
 * cognitoUser.getSession();
 * ```
 * 
 * @category Hooks
 */
export function useCognitoUser(): CognitoUser {
  const act = useAct();
  const [cognitoUser, setCognitoUser] = useState<CognitoUser>({ signInUserSession: undefined } as CognitoUser);

  useEffect(() => {
    async function getCognitoUser() {
      if (!UserPoolId || !ClientId)
        throw new Error('Configuration error: userPoolId missing during getCognitoUser.');

      const pool = new CognitoUserPool({ UserPoolId, ClientId });
      const user = pool.getCurrentUser();

      if (!user) {
        act(AUTH_DENIAL, { isLoggedIn: false });
        return undefined;
      }

      await user.getSession();

      act(AUTH_SUCCESS, { isLoggedIn: true, username: user.getUsername() });

      user.isLoggedIn = true;
      user.attributes = await user.getUserAttributes();

      if (IdentityPoolId && user.signInUserSession) {
        const credentials = fromCognitoIdentityPool({
          identityPoolId: IdentityPoolId,
          client: new CognitoIdentityClient({ region: Region }),
          logins: {
            [`cognito-idp.${Region}.amazonaws.com/${UserPoolId}`]: user.signInUserSession.idToken.token
          }
        })
        user.credentials = await credentials();
      }

      setCognitoUser(user)
    }
    void getCognitoUser();
  }, [])

  return cognitoUser;
}