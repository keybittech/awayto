import { Reducer } from 'redux';
import {
  IGetManageUsersAction,
  IGetManageUsersInfoAction,
  ILockManageUsersAction,
  IManageUsersActionTypes,
  IManageUsersState,
  IPostManageUsersAction,
  IPutManageUsersAction,
  IUnlockManageUsersAction,
  IUserProfile,
  IPostManageUsersSubAction,
  IPostManageUsersAppAcctAction,
  IManageUsersActions,
  ILogoutActionTypes,
  IGetManageUsersByIdAction,
  IGetManageUsersBySubAction
} from 'awayto';

const initialManageUsersState: IManageUsersState = {};

function reduceGetManageUsers(state: IManageUsersState, action: IGetManageUsersAction): IManageUsersState {
  return { ...state, users: [...action.payload] };
}

function reducePostManageUsers(state: IManageUsersState, action: IPostManageUsersAction): IManageUsersState {
  state.users = Array.prototype.concat(state.users, action.payload);
  return { ...state };
}

function reducePutManageUsers(state: IManageUsersState, action: IPutManageUsersAction | IPostManageUsersSubAction | IPostManageUsersAppAcctAction | IGetManageUsersByIdAction | IGetManageUsersBySubAction): IManageUsersState {
  const payload = action.payload;
  state.users = state.users?.map((user: IUserProfile) => {
    if (user.sub === payload.sub) {
      return { ...user, ...payload }
    }
    return user;
  }) as IUserProfile[];
  return { ...state };
}

function reduceManageUsersInfo(state: IManageUsersState, action: IGetManageUsersInfoAction): IManageUsersState {
  const payload = action.payload;
  const { users } = state;
  if (users) {
    payload.forEach((up: IUserProfile) => {
      const user = users.find((u: IUserProfile) => u.sub == up.sub) as IUserProfile;
      if (user) {
        Object.assign(user, up);
      }
    })
  }
  return { ...state, users: Object.assign(state.users, users) }
}

function reduceLockState(state: IManageUsersState, action: ILockManageUsersAction | IUnlockManageUsersAction, locked: boolean): IManageUsersState {
  const { users } = state;
  if (users) {
    action.payload.forEach(user => {
      const u = users.find(u => u.username == user.username);
      if (u) u.locked = locked;
    })
  }
  return { ...state, ...{ users: Object.assign(state.users, users) } };
}

const manageUsersReducer: Reducer<IManageUsersState, IManageUsersActions> = (state = initialManageUsersState, action) => {
  switch (action.type) {
    case ILogoutActionTypes.LOGOUT:
      return initialManageUsersState;
    case IManageUsersActionTypes.GET_MANAGE_USERS:
      return reduceGetManageUsers(state, action);
    case IManageUsersActionTypes.POST_MANAGE_USERS:
      return reducePostManageUsers(state, action);
    case IManageUsersActionTypes.GET_MANAGE_USERS_BY_ID:
    case IManageUsersActionTypes.GET_MANAGE_USERS_BY_SUB:
    case IManageUsersActionTypes.POST_MANAGE_USERS_APP_ACCT:
    case IManageUsersActionTypes.POST_MANAGE_USERS_SUB:
    case IManageUsersActionTypes.PUT_MANAGE_USERS:
      return reducePutManageUsers(state, action);
    case IManageUsersActionTypes.LOCK_MANAGE_USERS:
      return reduceLockState(state, action, true);
    case IManageUsersActionTypes.UNLOCK_MANAGE_USERS:
      return reduceLockState(state, action, false);
    case IManageUsersActionTypes.GET_MANAGE_USERS_INFO:
      return reduceManageUsersInfo(state, action);
    default:
      return state;
  }
};

export default manageUsersReducer;