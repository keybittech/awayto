import { PayloadAction, IUserProfile } from '.';

declare global {
  /**
   * @category Awayto
   */
  export interface ISharedState { 
    manage: IManageState
    manageUsers: IManageUsersState;
    manageRoles: IManageRolesState;
    manageGroups: IManageGroupsState;
  }

  /**
   * @category Awayto
   */
  export type IManageModuleActions = IManageActions | IManageUsersActions | IManageRolesActions | IManageGroupsActions;

  /**
   * @category Awayto
   */
  export interface ISharedActionTypes {
    manage: IManageActionTypes;
    manageUsers: IManageUsersActionTypes;
    manageRoles: IManageRolesActionTypes;
    manageGroups: IManageGroupsActionTypes;
  }
}

/**
 * @category Manage
 */
export type IManage = {
  manageUsers: IManageUsersState;
  manageRoles: IManageRolesState;
  manageGroups: IManageGroupsState;
};

/**
 * @category Manage
 */
export type IManageState = Partial<IManage>;

/**
 * @category Manage
 */
export enum IManageActionTypes {
  GET_MODULES = "manage/GET_MODULES"
}

/**
 * @category Manage
 */
export type IGetModulesAction = PayloadAction<IManageActionTypes.GET_MODULES, IManage>;

/**
 * @category Manage
 */
export type IManageActions = IGetModulesAction;



/**
 * @category ManageUsers
 */
export type IManageUsers = {
  users: IUserProfile[],
  error: Error | string
};

/**
 * @category ManageUsers
 */
export type IManageUsersState = Partial<IManageUsers>;

/**
 * @category ManageUsers
 */
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


/**
 * @category ManageUsers
 */
export type IGetManageUsersAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS, IUserProfile[]>;

/**
 * @category ManageUsers
 */
export type IGetManageUsersByIdAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS_BY_ID, IUserProfile>;

/**
 * @category ManageUsers
 */
export type IGetManageUsersInfoAction = PayloadAction<IManageUsersActionTypes.GET_MANAGE_USERS_INFO, IUserProfile[]>;

/**
 * @category ManageUsers
 */
export type IPostManageUsersAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS, IUserProfile>;

/**
 * @category ManageUsers
 */
export type IPostManageUsersSubAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS_SUB, IUserProfile>;

/**
 * @category ManageUsers
 */
export type IPostManageUsersAppAcctAction = PayloadAction<IManageUsersActionTypes.POST_MANAGE_USERS_APP_ACCT, IUserProfile>;

/**
 * @category ManageUsers
 */
export type IPutManageUsersAction = PayloadAction<IManageUsersActionTypes.PUT_MANAGE_USERS, IUserProfile>;

/**
 * @category ManageUsers
 */
export type ILockManageUsersAction = PayloadAction<IManageUsersActionTypes.LOCK_MANAGE_USERS, IUserProfile[]>;

/**
 * @category ManageUsers
 */
export type IUnlockManageUsersAction = PayloadAction<IManageUsersActionTypes.UNLOCK_MANAGE_USERS, IUserProfile[]>;

/**
 * @category ManageUsers
 */
export type IManageUsersActions = IGetManageUsersAction
  | IGetManageUsersByIdAction
  | IGetManageUsersInfoAction
  | IPostManageUsersAction
  | IPostManageUsersSubAction
  | IPostManageUsersAppAcctAction
  | IPutManageUsersAction
  | ILockManageUsersAction
  | IUnlockManageUsersAction;



/**
 * @category Role
 */
export type IRole = {
  id: string;
  name: string;
}

/**
 * @category Role
 */
export type IRoleState = Partial<IRole>;


/**
 * @category Role
 */
export type IManageRoles = {
  roles: IRole[],
  error?: Error | string
};

/**
 * @category Role
 */
export type IManageRolesState = Partial<IManageRoles>;

/**
 * @category Role
 */
export enum IManageRolesActionTypes {
  GET_MANAGE_ROLES = "GET/manage/roles",
  POST_MANAGE_ROLES = "POST/manage/roles",
  PUT_MANAGE_ROLES = "PUT/manage/roles",
  DELETE_MANAGE_ROLES = "DELETE/manage/roles",
}

/**
 * @category Role
 */
export type IGetManageRolesAction = PayloadAction<IManageRolesActionTypes.GET_MANAGE_ROLES, IRole[]>;

/**
 * @category Role
 */
export type IPostManageRolesAction = PayloadAction<IManageRolesActionTypes.POST_MANAGE_ROLES, IRole>;

/**
 * @category Role
 */
export type IPutManageRolesAction = PayloadAction<IManageRolesActionTypes.PUT_MANAGE_ROLES, IRoleState>;

/**
 * @category Role
 */
export type IDeleteManageRolesAction = PayloadAction<IManageRolesActionTypes.DELETE_MANAGE_ROLES, IRoleState>;


/**
 * @category Role
 */
export type IManageRolesActions = IGetManageRolesAction
  | IPostManageRolesAction
  | IPutManageRolesAction
  | IDeleteManageRolesAction;



/**
 * @category Group
 */
export type IGroup = {
  id: string;
  name: string;
  users: number;
  roles: IRole[];
}


/**
 * @category Group
 */
export type IGroupState = Partial<IGroup>;


/**
 * @category Group
 */
export type IManageGroups = {
  groups: IGroup[],
  isValid: boolean,
  needCheckName: boolean,
  checkingName: boolean,
  checkedName: string,
  error: Error | string
};

/**
 * @category Group
 */
export type IManageGroupsState = Partial<IManageGroups>;

/**
 * @category Group
 */
export enum IManageGroupsActionTypes {
  GET_MANAGE_GROUPS = "GET/manage/groups",
  CHECK_GROUP_NAME = "GET/manage/group/valid/:name",
  POST_MANAGE_GROUPS = "POST/manage/groups",
  PUT_MANAGE_GROUPS = "PUT/manage/groups",
  DELETE_MANAGE_GROUPS = "DELETE/manage/groups",
}

/**
 * @category Group
 */
export type IGetManageGroupsAction = PayloadAction<IManageGroupsActionTypes.GET_MANAGE_GROUPS, IGroup[]>;

/**
 * @category Group
 */
export type ICheckGroupNameAction = PayloadAction<IManageGroupsActionTypes.CHECK_GROUP_NAME, IManageGroupsState>;

/**
 * @category Group
 */
export type IPostManageGroupsAction = PayloadAction<IManageGroupsActionTypes.POST_MANAGE_GROUPS, IGroup>;

/**
 * @category Group
 */
export type IPutManageGroupsAction = PayloadAction<IManageGroupsActionTypes.PUT_MANAGE_GROUPS, IGroupState>;

/**
 * @category Group
 */
export type IDeleteManageGroupsAction = PayloadAction<IManageGroupsActionTypes.DELETE_MANAGE_GROUPS, IGroupState>;


/**
 * @category Group
 */
export type IManageGroupsActions = IGetManageGroupsAction 
  | ICheckGroupNameAction 
  | IPostManageGroupsAction 
  | IPutManageGroupsAction 
  | IDeleteManageGroupsAction;
