import { AdminGetUserResponse } from '@aws-sdk/client-cognito-identity-provider';
import { LogoutAction } from 'awayto';
import { PayloadAction, IGroup } from '.';

declare global {
  /**
   * @category Awayto
   */
  interface ISharedState { 
    profile: IUserProfileState
  }
  /**
   * @category Awayto
   */
  type IProfileModuleActions = IUserProfileActions | IUuidGroupsActions | IUuidRolesActions;
  /**
   * @category Awayto
   */
  interface ISharedActionTypes {
    userProfile: IUserProfileActionTypes;
    uuidGroups: IUuidGroupsActionTypes;
    uuidRoles: IUuidRolesActionTypes
  }
}

/**
 * @category UserProfile
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
};


/**
 * @category UserProfile
 */
export type IUserProfileState = Partial<IUserProfile>;

/**
 * @category Action Types
 */
export enum IUserProfileActionTypes {
  SIGNUP_USER = "login/SIGNUP_USER",
  POST_USERS = "POST/users",
  PUT_USERS = "PUT/users",
  GET_USER_PROFILE = "GET/users/profile",
  GET_USER_BY_SUB = "GET/users/profile/sub/:id",
  DELETE_USER = "DELETE/users"
}


/**
 * @category UserProfile
 */
export type IPostUserProfileAction = PayloadAction<IUserProfileActionTypes.POST_USERS, IUserProfile>;

/**
 * @category UserProfile
 */
export type IPutUserProfileAction = PayloadAction<IUserProfileActionTypes.PUT_USERS, IUserProfile>;

/**
 * @category UserProfile
 */
export type IGetUserProfileAction = PayloadAction<IUserProfileActionTypes.GET_USER_PROFILE, IUserProfile>;

/**
 * @category UserProfile
 */
export type IGetUserProfileBySubAction = PayloadAction<IUserProfileActionTypes.GET_USER_BY_SUB, IUserProfile>;

/**
 * @category UserProfile
 */
export type IDeleteUserProfileAction = PayloadAction<IUserProfileActionTypes.DELETE_USER, IUserProfileState>;

/**
 * @category UserProfile
 */
export type ISignUpUserAction = PayloadAction<IUserProfileActionTypes.SIGNUP_USER, IUserProfile>;


/**
 * @category UserProfile
 */
export type IUserProfileActions = LogoutAction
  | IPostUserProfileAction 
  | IPutUserProfileAction 
  | IGetUserProfileAction 
  | IGetUserProfileBySubAction 
  | IDeleteUserProfileAction
  | ISignUpUserAction;



/**
 * @category Group
 */
export type IUuidGroups = {
  id?: string;
  parentUuid: string;
  groupId: string;
};

/**
 * @category Group
 */
export type IUuidGroupsState = Partial<IUuidGroups>;

/**
 * @category Action Types
 */
export enum IUuidGroupsActionTypes {
  UUID_GROUPS = "UuidGroups/UUID_GROUPS"
}

/**
 * @category Group
 */
export type IPostUuidGroupsAction = PayloadAction<IUuidGroupsActionTypes.UUID_GROUPS, IUuidGroups>;

/**
 * @category Group
 */
export type IUuidGroupsActions = IPostUuidGroupsAction;



/**
 * @category Role
 */
export type IUuidRoles = {
  id?: string;
  parentUuid: string;
  roleId: string;
}

/**
 * @category Role
 */
export type IUuidRolesState = Partial<IUuidRoles>;

/**
 * @category Role
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
 * @category Role
 */
export type IUuidRolesUserAction = PayloadAction<IUuidRolesActionTypes.UUID_ROLES, IUuidRolesState>;

/**
 * @category Role
 */
export type IUuidRolesActions = IUuidRolesUserAction;