import { authenticateUserDefaultAuth } from './authenticateUserDefaultAuth';

import {
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandOutput,
  GetUserCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import {
  ICognitoUserPoolData,
  ICognitoUserData,
  ICognitoUserSessionData,
  CognitoJwtTokenType,
  CognitoUserSessionType,
  CognitoUserPoolType,
  CognitoUserType,
  ICognitoStorage
} from './types/index.d';


/**
 * @category Cognito
 */
export class CognitoJwtToken implements CognitoJwtTokenType {
  token: string;
  payload: Record<string, unknown>;
  constructor(token: string) {
    this.token = token || '';
    this.payload = this.decodePayload();
  }
  decodePayload = (): Record<string, unknown> => {
    const payload = this.token.split('.')[1];
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as Record<string, unknown>;
    } catch (err) {
      return {};
    }
  }
  getToken = (): string => this.token;
  getExpiration = (): number => this.payload.exp as number;
  getIssuedAt = (): number => this.payload.iat as number;
}

/**
 * @category Cognito
 */
export class CognitoIdToken extends CognitoJwtToken { }

/**
 * @category Cognito
 */
export class CognitoAccessToken extends CognitoJwtToken { }

/**
 * @category Cognito
 */
export class CognitoRefreshToken extends CognitoJwtToken { }


/**
 * @category Cognito
 */
export class CognitoUserSession implements CognitoUserSessionType {
  clockDrift: number;
  idToken: CognitoIdToken;
  accessToken: CognitoAccessToken;
  refreshToken: CognitoRefreshToken | undefined;
  constructor({ IdToken, AccessToken, RefreshToken, ClockDrift }: ICognitoUserSessionData) {
    if (AccessToken == null || IdToken == null)
      throw new Error('Id token and Access Token must be present.');

    this.idToken = IdToken;
    this.accessToken = AccessToken;
    this.refreshToken = RefreshToken;
    this.clockDrift = ClockDrift ?? this.calculateClockDrift();
  }

  getIdToken = (): CognitoJwtToken => this.idToken;
  getRefreshToken = (): CognitoJwtToken | undefined => this.refreshToken;
  getAccessToken = (): CognitoJwtToken => this.accessToken;
  getClockDrift = (): number => this.clockDrift;

  calculateClockDrift(): number {
    const now = Math.floor(new Date().getTime() / 1000);
    const iat = Math.min(
      this.accessToken.getIssuedAt(),
      this.idToken.getIssuedAt()
    );

    return now - iat;
  }

  isValid(): boolean {
    const now = Math.floor(new Date().getTime() / 1000);
    const adjusted = now - this.clockDrift;

    return (
      adjusted < this.accessToken.getExpiration() &&
      adjusted < this.idToken.getExpiration()
    );
  }
}


/**
 * @category Cognito
 */
export class CognitoUserPool implements CognitoUserPoolType {
  userPoolId: string;
  clientId: string;
  client: CognitoIdentityProviderClient;
  storage: Storage;
  constructor({ UserPoolId, ClientId }: ICognitoUserPoolData) {

    if (!UserPoolId || !ClientId)
      throw new Error('Both UserPoolId and ClientId are required.');

    if (!/^[\w-]+_.+$/.test(UserPoolId))
      throw new Error('Invalid UserPoolId format.');

    const region = UserPoolId.split('_')[0];

    this.userPoolId = UserPoolId;
    this.clientId = ClientId;
    this.client = new CognitoIdentityProviderClient({ region });
    this.storage = sessionStorage;
  }

  getUserPoolId = (): string => this.userPoolId;
  getClientId = (): string => this.clientId;

  getCurrentUser(): CognitoUser | null {
    const lastAuthUser = this.storage.getItem(`CognitoIdentityServiceProvider.${this.clientId}.LastAuthUser`);
    return lastAuthUser ? new CognitoUser({
      Username: lastAuthUser,
      Pool: this,
      Storage: this.storage,
    }) : null;
  }

  async signUp(username: string, password: string, userAttributes: AttributeType[]): Promise<void> {
    await this.client.send(new SignUpCommand({
      ClientId: this.clientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes
    }));
  }
}

/**
 * @category Cognito
 */
export class CognitoUser implements CognitoUserType {
  username: string;
  pool: CognitoUserPoolType;
  client: CognitoIdentityProviderClient;
  signInUserSession: CognitoUserSessionType | undefined;
  authenticationFlowType: string;
  storage: ICognitoStorage;
  keyPrefix: string;
  userDataKey: string;

  constructor({ Username, Pool, Storage }: ICognitoUserData) {
    if (Username == null || Pool == null)
      throw new Error('Username and Pool information are required.');

    this.username = Username;
    this.pool = Pool;

    this.client = Pool.client;

    this.signInUserSession = undefined;
    this.authenticationFlowType = 'USER_SRP_AUTH';

    this.storage = Storage || sessionStorage;

    this.keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}`;
    this.userDataKey = `${this.keyPrefix}.${this.username}.userData`;
  }

  cacheUserData(userData: Record<string, unknown>): void {
    this.storage.setItem(this.userDataKey, JSON.stringify(userData))
  }

  clearCachedUserData(): void {
    this.storage.removeItem(this.userDataKey)
  }

  getSignInUserSession(): CognitoUserSessionType | undefined {
    return this.signInUserSession;
  }

  getUsername(): string {
    return this.username;
  }

  async confirmSignUp(confirmationCode: string, forceAliasCreation: boolean): Promise<ConfirmSignUpCommandOutput> {
    return await this.client.send(new ConfirmSignUpCommand({
      ClientId: this.pool.getClientId(),
      ConfirmationCode: confirmationCode,
      Username: this.username,
      ForceAliasCreation: forceAliasCreation
    }));
  }

  cache(action: string): void {
    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}`;
    const idTokenKey = `${keyPrefix}.${this.username}.idToken`;
    const accessTokenKey = `${keyPrefix}.${this.username}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.${this.username}.refreshToken`;
    const clockDriftKey = `${keyPrefix}.${this.username}.clockDrift`;
    const lastUserKey = `${keyPrefix}.LastAuthUser`;

    if ('session' == action) {
      this.storage.setItem(idTokenKey, this.signInUserSession?.getIdToken().getToken() as string);
      this.storage.setItem(accessTokenKey, this.signInUserSession?.getAccessToken().getToken() as string);
      this.storage.setItem(refreshTokenKey, this.signInUserSession?.getRefreshToken()?.getToken() as string);
      this.storage.setItem(clockDriftKey, `${this.signInUserSession?.getClockDrift() as number}`);
      this.storage.setItem(lastUserKey, this.username);

    } else if ('clear' == action) {
      this.storage.removeItem(idTokenKey);
      this.storage.removeItem(accessTokenKey);
      this.storage.removeItem(refreshTokenKey);
      this.storage.removeItem(lastUserKey);
      this.storage.removeItem(clockDriftKey);
      this.clearCachedUserData();
    }
  }

  setSignInUserSession(signInUserSession: CognitoUserSession): void {
    this.clearCachedUserData();
    this.signInUserSession = signInUserSession;
    this.cache('session');
  }

  async getSession(): Promise<CognitoUserSessionType> {
    if (this.username == null)
      throw new Error('Username is null. Cannot retrieve a new session')

    if (this.signInUserSession != null && this.signInUserSession.isValid())
      return this.signInUserSession;

    const keyPrefix = `CognitoIdentityServiceProvider.${this.pool.getClientId()}.${this.username}`;
    const idTokenKey = `${keyPrefix}.idToken`;
    const accessTokenKey = `${keyPrefix}.accessToken`;
    const refreshTokenKey = `${keyPrefix}.refreshToken`;
    const clockDriftKey = `${keyPrefix}.clockDrift`;

    if (this.storage.getItem(idTokenKey)) {
      const refreshToken = new CognitoRefreshToken(this.storage.getItem<string>(refreshTokenKey));
      const idToken = new CognitoIdToken(this.storage.getItem<string>(idTokenKey));
      const accessToken = new CognitoAccessToken(this.storage.getItem<string>(accessTokenKey));
      const clockDrift = parseInt(this.storage.getItem<string>(clockDriftKey), 0) || 0;

      const cachedSession = new CognitoUserSession({
        RefreshToken: refreshToken,
        IdToken: idToken,
        AccessToken: accessToken,
        ClockDrift: clockDrift
      });

      if (cachedSession.isValid()) {
        this.signInUserSession = cachedSession;
        return this.signInUserSession;
      }

      if (!refreshToken.getToken())
        throw new Error('Cannot retrieve a new session. Please authenticate.');

      return await this.refreshSession(refreshToken);
    } else {
      throw new Error('Local storage is missing an ID Token, Please authenticate');
    }
  }

  async refreshSession(refreshToken: CognitoRefreshToken): Promise<CognitoUserSessionType> {
    const authParameters = {} as { [key: string]: string; };
    authParameters.REFRESH_TOKEN = refreshToken.getToken();

    const { AuthenticationResult } = await this.client.send(new InitiateAuthCommand({
      ClientId: this.pool.getClientId(),
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: authParameters
    }))

    if (!AuthenticationResult) {
      this.cache('clear');
      throw new Error('User is not authorized.');
    }

    if (!Object.prototype.hasOwnProperty.call(AuthenticationResult, 'RefreshToken')) {
      AuthenticationResult.RefreshToken = refreshToken.getToken();
    }

    try {
      this.signInUserSession = this.getCognitoUserSession(AuthenticationResult);
  
      this.cache('session');
  
      return this.signInUserSession;
    } catch (error) {
      throw error;
    }
  }

  getCognitoUserSession({ IdToken, AccessToken, RefreshToken }: AuthenticationResultType): CognitoUserSession {
    
    if (!IdToken || !AccessToken)
      throw new Error("Could not retrieve session. Please login.");

    return new CognitoUserSession({
      IdToken: new CognitoIdToken(IdToken),
      AccessToken: new CognitoAccessToken(AccessToken),
      RefreshToken: RefreshToken ? new CognitoRefreshToken(RefreshToken) : undefined,
    });
  }

  signOut(): void {
    this.signInUserSession = undefined;
    this.cache('clear');
  }

  async getUserAttributes(): Promise<AttributeType[]> {
    if (!(this.signInUserSession != undefined && this.signInUserSession.isValid()))
      throw new Error('User is not authenticated.')

    return (await this.client.send(new GetUserCommand({
      AccessToken: this.signInUserSession.getAccessToken().getToken()
    }))).UserAttributes as AttributeType[];
  }

  completeNewPasswordChallenge(pass: string): string { return pass; }
}

const {
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_CLIENT_ID: ClientId
} = process.env;

/**
 * @category Cognito
 */
export { UserPoolId, ClientId }

/**
 * @category Cognito
 */
export const getUserPool = (): CognitoUserPool => {
  if (!UserPoolId || !ClientId)
    throw new Error('Configuration error: missing pool or client ids.')
  return new CognitoUserPool({ UserPoolId, ClientId });
};

/**
 * @category Cognito
 */
export const cognitoSSRPLogin = async (Username: string, Password: string): Promise<string | void> => {

  const response = await authenticateUserDefaultAuth({ Username, Password });
  const { ChallengeName, AuthenticationResult } = response;

  if (ChallengeName) {
    return ChallengeName;
  } else {
    const { IdToken, AccessToken, RefreshToken } = AuthenticationResult as Required<AuthenticationResultType>;

    const cognitoUser = new CognitoUser({ Username, Pool: getUserPool() });

    cognitoUser.setSignInUserSession(new CognitoUserSession({
      IdToken: new CognitoIdToken(IdToken),
      AccessToken: new CognitoAccessToken(AccessToken),
      RefreshToken: new CognitoRefreshToken(RefreshToken)
    }));

    sessionStorage.setItem('id', IdToken);
    sessionStorage.setItem('accessToken', AccessToken);
    sessionStorage.setItem('provider', 'user_pool');
    sessionStorage.setItem('providerToken', '');
  }
}

// TODO May be used with Federated IdP
// export const authUser = async (): Promise<boolean> => {
//   const pool = getUserPool();
//   const cognitoUser = pool.getCurrentUser();

//   if (!cognitoUser)
//     return false;

//   const jwtToken = new CognitoJwtToken(sessionStorage.getItem('idToken') as string)

//   if (Date.now() < (jwtToken.getExpiration() - 60000))
//     return true;

//   const provider = sessionStorage.getItem('provider');
//   // let token = sessionStorage.getItem('providerToken');

//   switch (provider) {
//     case 'facebook':
//       break;
//     case 'google':
//       // token = ....
//       // persist token here if needed
//       break;
//     case 'user_pool': {
//       try {
//         await cognitoUser.getSession();
//       } catch (error) {
//         return false;
//       }
//       break;
//     }
//     default:
//       return false;
//   }

//   return true;
// };

/**
 * @category Cognito
 */
export function logoutUser(): void {
  const pool = getUserPool();
  const cognitoUser = pool.getCurrentUser();
  if (cognitoUser)
    cognitoUser.signOut();
}

/**
 * @category Cognito
 */
export const cognitoPoolSignUp = async (username: string, password: string, email: string): Promise<void> => {
  const userAttributes = [
    {
      Name: 'email',
      Value: email
    },
    {
      Name: 'custom:admin',
      Value: 'public:guest'
    }
  ];
  await getUserPool().signUp(username, password, userAttributes);
}
