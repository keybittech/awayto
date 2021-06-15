import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js/core';
// eslint-disable-next-line
import TypedArrays from 'crypto-js/lib-typedarrays'; // necessary for crypto js
import Base64 from 'crypto-js/enc-base64';
import HmacSHA256 from 'crypto-js/hmac-sha256';

import { AttributeType, CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';

import AuthenticationHelper from './auth/AuthenticationHelper';
import BigInteger from './auth/BigInteger';
import DateHelper from './auth/DateHelper';

import { CognitoAuthResponse, AuthenticationHelper as AuthHelperType } from './types/index.d';

const {
  REACT_APP_AWS_REGION: region,
  REACT_APP_COGNITO_USER_POOL_ID: userPoolId,
  REACT_APP_COGNITO_CLIENT_ID: clientId
} = process.env;

export const authenticateUserDefaultAuth = async (authDetails: { [key: string]: string }): Promise<CognitoAuthResponse> => (

  //  Use a Promise here to interact with callback methods of yore
  new Promise((resolve, reject) => {

    if (!userPoolId)
      throw new Error('Configuration error: userPoolId missing during auth.');

    const client = new CognitoIdentityProviderClient({ region });
    const { Username, Password } = authDetails;
    const authenticationHelper = new AuthenticationHelper(userPoolId.split('_')[1]) as AuthHelperType;
    const dateHelper = new DateHelper();

    const authParameters: Record<string, string> = {};
    authParameters.USERNAME = Username;

    authenticationHelper.getLargeAValue((err, SRP_A) => {
      if (err)
        reject(err)

      authParameters.SRP_A = SRP_A;

      client.send(new InitiateAuthCommand({
        AuthFlow: 'USER_SRP_AUTH',
        ClientId: clientId,
        AuthParameters: authParameters
      })).then(data => {

        const { USER_ID_FOR_SRP, SRP_B, SALT, SECRET_BLOCK } = data.ChallengeParameters as Record<string, string>

        const serverBValue = new BigInteger(SRP_B, 16);
        const salt = new BigInteger(SALT, 16);

        authenticationHelper.getPasswordAuthenticationKey(
          USER_ID_FOR_SRP,
          Password,
          serverBValue,
          salt,
          (errOnHkdf: Error, hkdf: number[]) => {
            // getPasswordAuthenticationKey callback start
            if (errOnHkdf)
              reject(errOnHkdf);

            const dateNow = dateHelper.getNowString();

            const message = CryptoJS.lib.WordArray.create(
              Buffer.concat([
                Buffer.from(userPoolId.split('_')[1], 'utf8'),
                Buffer.from(USER_ID_FOR_SRP, 'utf8'),
                Buffer.from(SECRET_BLOCK, 'base64'),
                Buffer.from(dateNow, 'utf8'),
              ]) as unknown as number[]
            );

            const key = CryptoJS.lib.WordArray.create(hkdf);
            const signatureString = Base64.stringify(HmacSHA256(message, key));

            client.send(new RespondToAuthChallengeCommand({
              ChallengeName: 'PASSWORD_VERIFIER',
              ClientId: clientId,
              ChallengeResponses: {
                USERNAME: USER_ID_FOR_SRP,
                PASSWORD_CLAIM_SECRET_BLOCK: SECRET_BLOCK,
                TIMESTAMP: dateNow,
                PASSWORD_CLAIM_SIGNATURE: signatureString
              },
              Session: data.Session
            })).then(res => {
              const { ChallengeName, Session, ChallengeParameters, AuthenticationResult } = res;

              if (ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                // Session = Session;

                let userAttributes = null;
                let rawRequiredAttributes = null;
                const requiredAttributes = [];
                const userAttributesPrefix = authenticationHelper.getNewPasswordRequiredChallengeUserAttributePrefix();

                if (ChallengeParameters) {
                  userAttributes = JSON.parse(ChallengeParameters.userAttributes) as AttributeType[];
                  rawRequiredAttributes = JSON.parse(ChallengeParameters.requiredAttributes) as string[];
                }

                if (rawRequiredAttributes) {
                  for (let i = 0; i < rawRequiredAttributes.length; i++) {
                    requiredAttributes[i] = rawRequiredAttributes[i].substr(userAttributesPrefix.length);
                  }
                }

                resolve({ userAttributes, requiredAttributes, ChallengeName, Session, ChallengeParameters, AuthenticationResult } as CognitoAuthResponse);
              } else {
                resolve({ AuthenticationResult } as CognitoAuthResponse);
              }
            }).catch(err => {
              throw err;
            })
          }
        );

      }).catch(err => {
        throw err;
      });
    });
  })
)