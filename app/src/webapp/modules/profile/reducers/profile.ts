import { Reducer } from 'redux';
import {
  IUserProfileState,
  IUserProfileActionTypes,
  IUserProfileActions
} from 'awayto';

const initialUserProfileState: IUserProfileState = {};

const profileReducer: Reducer<IUserProfileState, IUserProfileActions> = (state = initialUserProfileState, action) => {
  switch (action.type) {
    case IUserProfileActionTypes.HAS_CODE:
    case IUserProfileActionTypes.SIGNUP_USER:
    case IUserProfileActionTypes.POST_USER_PROFILE:
    case IUserProfileActionTypes.PUT_USER_PROFILE:
    case IUserProfileActionTypes.GET_USER_PROFILE_DETAILS:
    case IUserProfileActionTypes.GET_USER_PROFILE_DETAILS_BY_SUB:
    case IUserProfileActionTypes.GET_USER_PROFILE_DETAILS_BY_ID:
    case IUserProfileActionTypes.DISABLE_USER_PROFILE:
      return { ...state, ...action.payload };
    default:
      return { ...state };
  }
};

export default profileReducer;