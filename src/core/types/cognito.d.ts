import {
  AttributeType,
  AuthenticationResultType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommandOutput,
  RespondToAuthChallengeCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

export interface CognitoJwtTokenType {
  token: string;
  payload: Record<string, unknown>;
  // new (token: string): CognitoJwtTokenType;
  decodePayload(): Record<string, unknown>;
  getToken(): string;
  getExpiration(): number;
  getIssuedAt(): number;
}

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

export type CognitoAuthResponse = RespondToAuthChallengeCommandOutput & {
  userAttributes: AttributeType[];
  requiredAttributes: string[];
}

export class AuthenticationHelper {
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

export interface CodeDeliveryDetails {
  AttributeName: string;
  DeliveryMedium: string;
  Destination: string;
}

export type ClientMetadata = { [key: string]: string } | undefined;

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

export interface IMfaSettings {
  PreferredMfa: boolean;
  Enabled: boolean;
}
export interface IAuthenticationDetailsData {
  Username: string;
  Password?: string;
  ValidationData?: Record<string, unknown>;
  ClientMetadata?: ClientMetadata;
}

export class AuthenticationDetails {
  constructor(data: IAuthenticationDetailsData);

  public getUsername(): string;
  public getPassword(): string;
  public getValidationData(): unknown[];
}

export interface ICognitoStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  getItem<T>(key: string): T;
  removeItem(key: string): void;
  clear(): void;
}

export interface ISignUpResult {
  user: CognitoUserType;
  userConfirmed: boolean;
  userSub: string;
  codeDeliveryDetails: CodeDeliveryDetails;
}

export interface ICognitoUserPoolData {
  UserPoolId: string;
  ClientId: string;
  endpoint?: string;
  Storage?: ICognitoStorage;
  AdvancedSecurityDataCollectionFlag?: boolean;
}

export interface ICognitoUserSessionData {
  IdToken: CognitoJwtTokenType;
  AccessToken: CognitoJwtTokenType;
  RefreshToken?: CognitoJwtTokenType;
  ClockDrift?: number;
}

export interface ICognitoUserData {
  Username: string;
  Pool: CognitoUserPoolType;
  Storage?: ICognitoStorage;
}