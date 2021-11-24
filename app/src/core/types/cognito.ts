import {
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommandOutput,
  RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';


/**
 * @category Cognito
 */
export interface CognitoJwtTokenType {
  token: string;
  payload: Record<string, unknown>;
  // new (token: string): CognitoJwtTokenType;
  decodePayload(): Record<string, unknown>;
  getToken(): string;
  getExpiration(): number;
  getIssuedAt(): number;
}

/**
 * @category Cognito
 */
export interface CognitoUserSessionType {
  clockDrift: number;
  idToken: CognitoJwtTokenType;
  accessToken: CognitoJwtTokenType;
  refreshToken?: CognitoJwtTokenType;
	// new ({ IdToken, RefreshToken, AccessToken, ClockDrift }: ICognitoUserSessionData): CognitoUserSessionType;
	getIdToken(): CognitoJwtTokenType;
	getAccessToken(): CognitoJwtTokenType;
	getRefreshToken(): CognitoJwtTokenType | undefined;
	getClockDrift(): number;  
	calculateClockDrift(): number;
	isValid(): boolean;
}

/**
 * @category Cognito
 */
export interface CognitoUserPoolType {
  userPoolId: string;
  clientId: string;
  storage: Storage;
  client: CognitoIdentityProviderClient;
  // new (data: ICognitoUserPoolData): CognitoUserPoolType;
  getUserPoolId(): string;
  getClientId(): string;
  getCurrentUser(): CognitoUserType | null;
	signUp(username: string,	password: string, userAttributes: AttributeType[]): Promise<void>;
}

/**
 * @category Cognito
 */
export interface CognitoUserType {
  username: string;
  pool: CognitoUserPoolType;
  signInUserSession?: CognitoUserSessionType;
  client: CognitoIdentityProviderClient;
  Session?: string;
  authenticationFlowType: string;
  storage: ICognitoStorage;
  keyPrefix: string;
  userDataKey: string;
  // new ({ Username, Pool, Storage }: ICognitoUserData): CognitoUserType;
  cache(action: string): void;
	cacheUserData(userData: Record<string, unknown>): void;
	clearCachedUserData(): void;
  getSignInUserSession(): CognitoUserSessionType | undefined;
  completeNewPasswordChallenge(pass: string): void;
  getUsername(): string;
  confirmSignUp(confirmationCode: string, forceAliasCreation: boolean): Promise<ConfirmSignUpCommandOutput>;
  setSignInUserSession(signInUserSession: CognitoUserSessionType): void;
  getSession(): Promise<CognitoUserSessionType>;
  refreshSession(refreshToken: CognitoJwtTokenType): Promise<CognitoUserSessionType>;
  getCognitoUserSession({ IdToken, AccessToken, RefreshToken }: AuthenticationResultType): CognitoUserSessionType;
  signOut(): void;
  getUserAttributes(): Promise<AttributeType[]>;
}

/**
 * @category Cognito
 */
export type CognitoAuthResponse = RespondToAuthChallengeCommandOutput & {
  userAttributes: AttributeType[];
  requiredAttributes: string[];
}

/**
 * @category Cognito
 */
export declare class AuthenticationHelper {
  constructor(region: string);
  getNewPasswordRequiredChallengeUserAttributePrefix(): string;
  getPasswordAuthenticationKey(
    id: string, 
    password: string, 
    serverBValue: unknown, 
    salt: unknown, 
    callback: (errOnHkdf: Error, hkdf: number[]) => void
  ): void;
  getLargeAValue(callback: (err: Error, largeAValue: string) => void): void;
}

/**
 * @category Cognito
 */
export interface CodeDeliveryDetails {
  AttributeName: string;
  DeliveryMedium: string;
  Destination: string;
}

/**
 * @category Cognito
 */
export type ClientMetadata = { [key: string]: string } | undefined;

/**
 * @category Cognito
 */
export interface IAuthenticationCallback {
  onSuccess: (
    session: CognitoUserSessionType,
    userConfirmationNecessary?: boolean
  ) => void;
  onFailure: (err: unknown) => void;
  newPasswordRequired?: (
    userAttributes: unknown,
    requiredAttributes: unknown
  ) => void;
  mfaRequired?: (challengeName: unknown, challengeParameters: unknown) => void;
  totpRequired?: (challengeName: unknown, challengeParameters: unknown) => void;
  customChallenge?: (challengeParameters: unknown) => void;
  mfaSetup?: (challengeName: unknown, challengeParameters: unknown) => void;
  selectMFAType?: (challengeName: unknown, challengeParameters: unknown) => void;
}

/**
 * @category Cognito
 */
export interface IMfaSettings {
  PreferredMfa: boolean;
  Enabled: boolean;
}

/**
 * @category Cognito
 */
export interface IAuthenticationDetailsData {
  Username: string;
  Password?: string;
  ValidationData?: Record<string, unknown>;
  ClientMetadata?: ClientMetadata;
}

/**
 * @category Cognito
 */
export declare class AuthenticationDetails {
  constructor(data: IAuthenticationDetailsData);

  public getUsername(): string;
  public getPassword(): string;
  public getValidationData(): unknown[];
}

/**
 * @category Cognito
 */
export interface ICognitoStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  getItem<T>(key: string): T;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * @category Cognito
 */
export interface ISignUpResult {
  user: CognitoUserType;
  userConfirmed: boolean;
  userSub: string;
  codeDeliveryDetails: CodeDeliveryDetails;
}

/**
 * @category Cognito
 */
export interface ICognitoUserPoolData {
  UserPoolId: string;
  ClientId: string;
  endpoint?: string;
  Storage?: Storage;
  AdvancedSecurityDataCollectionFlag?: boolean;
}

/**
 * @category Cognito
 */
export interface ICognitoUserSessionData {
  IdToken: CognitoJwtTokenType;
  AccessToken: CognitoJwtTokenType;
  RefreshToken?: CognitoJwtTokenType;
  ClockDrift?: number;
}

/**
 * @category Cognito
 */
export interface ICognitoUserData {
  Username: string;
  Pool: CognitoUserPoolType;
  Storage?: ICognitoStorage;
}