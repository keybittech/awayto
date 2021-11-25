import { AdminGetUserResponse } from '@aws-sdk/client-cognito-identity-provider';
import { PayloadAction, IGroup, LogoutAction } from '.';

declare global {
  /**
   * @category Awayto Redux
   */
  interface ISharedState { 
    profile: IUserProfileState
  }

  /**
   * @category Awayto Redux
   */
  type IProfileModuleActions = IUserProfileActions | IUuidGroupsActions | IUuidRolesActions;

  /**
   * @category Awayto Redux
   */
  interface ISharedActionTypes {
    userProfile: IUserProfileActionTypes;
    uuidGroups: IUuidGroupsActionTypes;
    uuidRoles: IUuidRolesActionTypes
  }
}

/**
 * @category Awayto
 */
export type IUserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  sub: string;
  username: string;
  groups: IGroup[];
  createdOn: string;
  updatedOn: string;
  file: File;
  locked: boolean;
  status: string;
  info: AdminGetUserResponse;
  signedUp: boolean;
  hasSignUpCode: boolean;
};


/**
 * @category User Profile
 */
export type IUserProfileState = Partial<IUserProfile>;

/**
 * @category Action Types
 */
export enum IUserProfileActionTypes {
  HAS_CODE = "login/HAS_CODE",
  SIGNUP_USER = "login/SIGNUP_USER",
  POST_USER_PROFILE = "POST/users",
  PUT_USER_PROFILE = "PUT/users",
  GET_USER_PROFILE_DETAILS = "GET/users/details",
  GET_USER_PROFILE_DETAILS_BY_SUB = "GET/users/details/sub/:sub",
  GET_USER_PROFILE_DETAILS_BY_ID = "GET/users/details/id/:id",
  DISABLE_USER_PROFILE = "PUT/users/:id/disable"
}


/**
 * @category User Profile
 */
 export type ISignUpUserAction = PayloadAction<IUserProfileActionTypes.SIGNUP_USER, IUserProfile>;

/**
 * @category User Profile
 */
 export type IHasCodeUserProfileAction = PayloadAction<IUserProfileActionTypes.HAS_CODE, IUserProfile>;

/**
 * @category User Profile
 */
export type IPostUserProfileAction = PayloadAction<IUserProfileActionTypes.POST_USER_PROFILE, IUserProfile>;

/**
 * @category User Profile
 */
export type IPutUserProfileAction = PayloadAction<IUserProfileActionTypes.PUT_USER_PROFILE, IUserProfile>;

/**
 * @category User Profile
 */
export type IGetUserProfileDetailsAction = PayloadAction<IUserProfileActionTypes.GET_USER_PROFILE_DETAILS, IUserProfile>;

/**
 * @category User Profile
 */
export type IGetUserProfileDetailsBySubAction = PayloadAction<IUserProfileActionTypes.GET_USER_PROFILE_DETAILS_BY_SUB, IUserProfile>;

/**
 * @category User Profile
 */
export type IGetUserProfileDetailsByIdAction = PayloadAction<IUserProfileActionTypes.GET_USER_PROFILE_DETAILS_BY_ID, IUserProfile>;

/**
 * @category User Profile
 */
export type IDisableUserProfileAction = PayloadAction<IUserProfileActionTypes.DISABLE_USER_PROFILE, IUserProfileState>;

/**
 * @category User Profile
 */
export type IUserProfileActions = LogoutAction
  | IHasCodeUserProfileAction
  | ISignUpUserAction
  | IPostUserProfileAction 
  | IPutUserProfileAction 
  | IGetUserProfileDetailsAction 
  | IGetUserProfileDetailsBySubAction 
  | IGetUserProfileDetailsByIdAction
  | IDisableUserProfileAction;



/**
 * @category Awayto
 */
export type IUuidGroups = {
  id?: string;
  parentUuid: string;
  groupId: string;
};

/**
 * @category Uuid Groups
 */
export type IUuidGroupsState = Partial<IUuidGroups>;

/**
 * @category Action Types
 */
export enum IUuidGroupsActionTypes {
  UUID_GROUPS = "UuidGroups/UUID_GROUPS"
}

/**
 * @category Uuid Groups
 */
export type IPostUuidGroupsAction = PayloadAction<IUuidGroupsActionTypes.UUID_GROUPS, IUuidGroups>;

/**
 * @category Uuid Groups
 */
export type IUuidGroupsActions = IPostUuidGroupsAction;



/**
 * @category Awayto
 */
export type IUuidRoles = {
  id?: string;
  parentUuid: string;
  roleId: string;
}

/**
 * @category Uuid Roles
 */
export type IUuidRolesState = Partial<IUuidRoles>;

/**
 * @category Awayto
 */
export type IManageUuidRoles = {
  roles?: IUuidRoles[];
  roleIds?: string[];
}

/**
 * @category Action Types
 */
export enum IUuidRolesActionTypes {
  UUID_ROLES = "common/UUID_ROLES"
}

/**
 * @category Uuid Roles
 */
export type IUuidRolesUserAction = PayloadAction<IUuidRolesActionTypes.UUID_ROLES, IUuidRolesState>;

/**
 * @category Uuid Roles
 */
export type IUuidRolesActions = IUuidRolesUserAction;