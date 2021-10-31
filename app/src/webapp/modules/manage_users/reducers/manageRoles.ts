import { Reducer } from 'redux';
import {
  IRole, 
  IGetManageRolesAction, 
  IManageRolesActionTypes, 
  IManageRolesState, 
  IPostManageRolesAction, 
  IPutManageRolesAction, 
  IDeleteManageRolesAction, 
  IManageRolesActions,
  ILogoutActionTypes
} from 'awayto';

const initialManageRolesState: IManageRolesState = {};

function reduceGetManageRoles(state: IManageRolesState, action: IGetManageRolesAction): IManageRolesState {
  return { ...state, roles: [ ...action.payload as IRole[] ] };
}

function reducePostManageRoles(state: IManageRolesState, action: IPostManageRolesAction): IManageRolesState {
  state.roles = Array.prototype.concat(state.roles, action.payload);
  return { ...state };
}

function reducePutManageRoles(state: IManageRolesState, action: IPutManageRolesAction): IManageRolesState {
  const payload = action.payload as IRole;
  state.roles = state.roles?.map((user: IRole) => {
    if (user.id === payload.id) {
      return { ...user, ...payload }
    }
    return user;
  });
  return { ...state };
}

function reduceDeleteState(state: IManageRolesState, action: IDeleteManageRolesAction): IManageRolesState {
  const { roles } = state;
  if (roles) {
    state.roles = roles.filter(role => role.id !== action.payload.id);
  }
  return state;
}

const manageRolesReducer: Reducer<IManageRolesState, IManageRolesActions> = (state = initialManageRolesState, action) => {
  switch (action.type) {
    case ILogoutActionTypes.LOGOUT:
      return initialManageRolesState;
    case IManageRolesActionTypes.GET_MANAGE_ROLES:
      return reduceGetManageRoles(state, action);
    case IManageRolesActionTypes.POST_MANAGE_ROLES:
      return reducePostManageRoles(state, action);
    case IManageRolesActionTypes.PUT_MANAGE_ROLES:
      return reducePutManageRoles(state, action);
    case IManageRolesActionTypes.DELETE_MANAGE_ROLES:
      return reduceDeleteState(state, action);
    default:
      return state;
  }
};

export default manageRolesReducer;