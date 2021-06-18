import { Reducer } from 'redux';
import {
  IUserProfileState, 
  IUserProfileActionTypes, 
  IUserProfileActions
} from 'awayto';

const initialUserProfileState: IUserProfileState = {};

const profileReducer: Reducer<IUserProfileState, IUserProfileActions> = (state = initialUserProfileState, action) => {
  switch(action.type) {
    case IUserProfileActionTypes.GET_USER_PROFILE:
    case IUserProfileActionTypes.SIGNUP_USER:
    case IUserProfileActionTypes.POST_USERS:
    case IUserProfileActionTypes.PUT_USERS:
    case IUserProfileActionTypes.GET_USER_BY_SUB:
    case IUserProfileActionTypes.DELETE_USER:
      return { ...state, ...action.payload };
    default:
      return { ...state };
  }
};

export default profileReducer;