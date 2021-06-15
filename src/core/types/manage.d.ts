import { PayloadAction, IUserProfile } from '.';

declare global {
  export interface ISharedState { 
    manage: IManageState
    manageUsers: IManageUsersState;
    manageRoles: IManageRolesState;
    manageGroups: IManageGroupsState;
  }
  // ISharedActions
  export type IManageModuleActions = IManageActions | IManageUsersActions | IManageRolesActions | IManageGroupsActions;
  export interface ISharedActionTypes {
    manage: IManageActionTypes;
    manageUsers: IManageUsersActionTypes;
    manageRoles: IManageRolesActionTypes;
    manageGroups: IManageGroupsActionTypes;
  }
}

export type IManage = {
  manageUsers: IManageUsersState;
  manageRoles: IManageRolesState;
  manageGroups: IManageGroupsState;
};

export type IManageState = Partial<IManage>;

export enum IManageActionTypes {
  GET_MODULES = "manage/GET_MODULES"
}

export type IGetModulesAction = PayloadAction<IManageActionTypes.GET_MODULES, IManage>;

export type IManageActions = IGetModulesAction;



///////////////
// MANAGE USERS
///////////////
export type IManageUsers = {
  users: IUserProfile[],
  error: Error | string
};

export type IManageUsersState = Partial<IManageUsers>;

export enum IManageUsersActionTypes {
  GET_MANAGE_USERS = "GET/manage/users",
  
  GET_MANAGE_USERS_BY_ID = "GET/manage/users/:id",
  GET_MANAGE_USERS_INFO = "GET/manage/users/info",
  POST_MANAGE_USERS = "POST/manage/users",
  POST_MANAGE_USERS_APP_ACCT = "POST/manage/users",
  POST_MANAGE_USERS_SUB = "POST/manage/users/sub",
  PUT_MANAGE_USERS = "PUT/manage/users",
  LOCK_MANAGE_USERS = "PUT/manage/users/lock",
  UNLOCK_MANAGE_USERS = "PUT/manage/users/unlock"
}

export type IGetManageUsersAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS, IUserProfile[]>;

export type IGetManageUsersByIdAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS_BY_ID, IUserProfile>;
export type IGetManageUsersInfoAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS_INFO, IUserProfile[]>;
export type IPostManageUsersAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS, IUserProfile>;
export type IPostManageUsersSubAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS_SUB, IUserProfile>;
export type IPostManageUsersAppAcctAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS_APP_ACCT, IUserProfile>;
export type IPutManageUsersAction = PayloadAction<IManageUsersActionTypes.PUT_MANAGE_USERS, IUserProfile>;
export type ILockManageUsersAction = PayloadAction<IManageUsersActionTypes.LOCK_MANAGE_USERS, IUserProfile[]>;
export type IUnlockManageUsersAction = PayloadAction<IManageUsersActionTypes.UNLOCK_MANAGE_USERS, IUserProfile[]>;

export type IManageUsersActions = IGetManageUsersAction
  | IGetManageUsersByIdAction
  | IGetManageUsersInfoAction
  | IPostManageUsersAction
  | IPostManageUsersSubAction
  | IPostManageUsersAppAcctAction
  | IPutManageUsersAction
  | ILockManageUsersAction
  | IUnlockManageUsersAction;


///////////////
// MANAGE ROLES
///////////////

export type IRole = {
  id: string;
  name: string;
}

export type IRoleState = Partial<IRole>;

export type IManageRoles = {
  roles: IRole[],
  error?: Error | string
};

export type IManageRolesState = Partial<IManageRoles>;

export enum IManageRolesActionTypes {
  GET_MANAGE_ROLES = "GET/manage/roles",
  POST_MANAGE_ROLES = "POST/manage/roles",
  PUT_MANAGE_ROLES = "PUT/manage/roles",
  DELETE_MANAGE_ROLES = "DELETE/manage/roles",
}

export type IGetManageRolesAction = PayloadAction<IManageRolesActionTypes.GET_MANAGE_ROLES, IRole[]>;
export type IPostManageRolesAction = PayloadAction<IManageRolesActionTypes.POST_MANAGE_ROLES, IRole>;
export type IPutManageRolesAction = PayloadAction<IManageRolesActionTypes.PUT_MANAGE_ROLES, IRoleState>;
export type IDeleteManageRolesAction = PayloadAction<IManageRolesActionTypes.DELETE_MANAGE_ROLES, IRoleState>;

export type IManageRolesActions = IGetManageRolesAction
  | IPostManageRolesAction
  | IPutManageRolesAction
  | IDeleteManageRolesAction;


////////////////
// MANAGE GROUPS
////////////////

export type IGroup = {
  id: string;
  name: string;
  users: number;
  roles: IRole[];
}

export type IGroupState = Partial<IGroup>;

export type IManageGroups = {
  groups: IGroup[],
  isValid: boolean,
  needCheckName: boolean,
  checkingName: boolean,
  checkedName: string,
  error: Error | string
};

export type IManageGroupsState = Partial<IManageGroups>;

export enum IManageGroupsActionTypes {
  GET_MANAGE_GROUPS = "GET/manage/groups",
  CHECK_GROUP_NAME = "GET/manage/group/valid/:name",
  POST_MANAGE_GROUPS = "POST/manage/groups",
  PUT_MANAGE_GROUPS = "PUT/manage/groups",
  DELETE_MANAGE_GROUPS = "DELETE/manage/groups",
}

export type IGetManageGroupsAction = PayloadAction<IManageGroupsActionTypes.GET_MANAGE_GROUPS, IGroup[]>;
export type ICheckGroupNameAction = PayloadAction<IManageGroupsActionTypes.CHECK_GROUP_NAME, IManageGroupsState>;
export type IPostManageGroupsAction = PayloadAction<IManageGroupsActionTypes.POST_MANAGE_GROUPS, IGroup>;
export type IPutManageGroupsAction = PayloadAction<IManageGroupsActionTypes.PUT_MANAGE_GROUPS, IGroupState>;
export type IDeleteManageGroupsAction = PayloadAction<IManageGroupsActionTypes.DELETE_MANAGE_GROUPS, IGroupState>;

export type IManageGroupsActions = IGetManageGroupsAction 
  | ICheckGroupNameAction 
  | IPostManageGroupsAction 
  | IPutManageGroupsAction 
  | IDeleteManageGroupsAction;
