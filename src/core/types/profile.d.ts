import { AdminGetUserResponse } from '@aws-sdk/client-cognito-identity-provider';
import { PayloadAction, IGroup } from '.';

declare global {
  export interface ISharedState { 
    profile: IUserProfileState
  }
  // ISharedActions
  export type IProfileModuleActions = IUserProfileActions | IUuidGroupsActions | IUuidRolesActions;
  export interface ISharedActionTypes {
    userProfile: IUserProfileActionTypes;
    uuidGroups: IUuidGroupsActionTypes;
    uuidRoles: IUuidRolesActionTypes
  }
}

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

export type IUserProfileState = Partial<IUserProfile>;

export enum IUserProfileActionTypes {
  SIGNUP_USER = "login/SIGNUP_USER",
  POST_USERS = "POST/users",
  PUT_USERS = "PUT/users",
  GET_USER_PROFILE = "GET/users/profile",
  GET_USER_BY_SUB = "GET/users/profile/sub/:id",
  DELETE_USER = "DELETE/users"
}

export type IPostUserProfileAction = PayloadAction<IUserProfileActionTypes.POST_USERS, IUserProfile>;
export type IPutUserProfileAction = PayloadAction<IUserProfileActionTypes.PUT_USERS, IUserProfile>;
export type IGetUserProfileAction = PayloadAction<IUserProfileActionTypes.GET_USER_PROFILE, IUserProfile>;
export type IGetUserProfileBySubAction = PayloadAction<IUserProfileActionTypes.GET_USER_BY_SUB, IUserProfile>;
export type IDeleteUserProfileAction = PayloadAction<IUserProfileActionTypes.DELETE_USER, IUserProfileState>;
export type ISignUpUserAction = PayloadAction<IUserProfileActionTypes.SIGNUP_USER, IUserProfile>;

export type IUserProfileActions = IPostUserProfileAction 
  | IPutUserProfileAction 
  | IGetUserProfileAction 
  | IGetUserProfileBySubAction 
  | IDeleteUserProfileAction
  | ISignUpUserAction;



export type IUuidGroups = {
  id?: string;
  parentUuid: string;
  groupId: string;
};

export type IUuidGroupsState = Partial<IUuidGroups>;

export enum IUuidGroupsActionTypes {
  UUID_GROUPS = "UuidGroups/UUID_GROUPS"
}

export type IPostUuidGroupsAction = PayloadAction<IUuidGroupsActionTypes.UUID_GROUPS, IUuidGroups>;

export type IUuidGroupsActions = IPostUuidGroupsAction;



export type IUuidRoles = {
  id?: string;
  parentUuid: string;
  roleId: string;
}

export type IUuidRolesState = Partial<IUuidRoles>;

export type IManageUuidRoles = {
  roles?: IUuidRoles[];
  roleIds?: string[];
}

export enum IUuidRolesActionTypes {
  UUID_ROLES = "common/UUID_ROLES"
}

export type IUuidRolesUserAction = PayloadAction<IUuidRolesActionTypes.UUID_ROLES, IUuidRolesState>;

export type IUuidRolesActions = IUuidRolesUserAction;