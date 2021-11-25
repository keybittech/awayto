
const {
  REACT_APP_AWAYTO_ID: awaytoId,
  REACT_APP_AWS_REGION: region,
  REACT_APP_COGNITO_USER_POOL_ID: userPoolId,
  REACT_APP_COGNITO_CLIENT_ID: clientId,
  REACT_APP_COGNITO_IDENTITY_POOL_ID: identityPoolId
} = process.env;

const AwaytoId = awaytoId || process.env['AwaytoId'] || '';
const Region = region || process.env['CognitoRegion'] || '';
const UserPoolId = userPoolId || process.env['CognitoUserPoolId'] || '';
const ClientId = clientId || process.env['CognitoClientId'] || '';
const IdentityPoolId = identityPoolId || process.env['CognitoIdentityPoolId'] || '';

export {
  AwaytoId,
  Region,
  UserPoolId,
  ClientId,
  IdentityPoolId
};

export * from './types';
export * from './util';
export * from './cognito';
export * from './s3';
export * from './ipfs';
export * from './files';