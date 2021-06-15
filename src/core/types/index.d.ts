import React, { ComponentType } from 'react';
import { RouterState } from 'connected-react-router';
import { RouteComponentProps } from 'react-router';
import { Action, ReducersMapObject, Store } from 'redux';
import { PersistState } from 'redux-persist';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { IStyles } from '../style';
import { CognitoUser } from '../cognito';

declare global {
  export interface ISharedState {
    root: ILoadedState;
    components: IBaseComponents;
    _persist: PersistState;
    router: RouterState<unknown>;
  }
  
  export type ISharedActions = ICommonModuleActions | IManageModuleActions | IProfileModuleActions;

  export type RouteProps = { [prop: string]: string }
  export type SafeRouteProps = Omit<RouteComponentProps<RouteProps>, "staticContext">;
  export type IProps = SafeRouteProps & {
    closeModal: () => void;
  } & {
    [prop: string]: boolean | string | number | ILoadedState | (() => void);
  };
  
  export type Props = IProps & SafeRouteProps & { 
    classes: IStyles
  }
  export type IBaseComponent = ComponentType<Props>
  export type IBaseComponents = { [component: string]: IBaseComponent }

  export type TempComponent = IBaseComponent | string | undefined
  export type LazyComponentPromise = Promise<{ default: IBaseComponent }>
}

export type IEmpty = undefined | null | void;

export type ILoadedState = ISharedState[keyof ISharedState];

// export type ISharedActionTypesType = typeof ISharedActions;
// export type IActions = ISharedActions[keyof ISharedActionTypesType];


export type IReducers = ReducersMapObject<ISharedState, ISharedActions>;
export type ILoadedReducers = Partial<IReducers>;

export type IActionTypes = ISharedActionTypes[keyof ISharedActionTypes];
export type MetaAction<Type, Meta> = Action<Type> & {
  meta?: Meta;
};
export type PayloadAction<Type, Payload, Meta = void> = MetaAction<Type, Meta> & {
  readonly payload: Payload;
};

export type ThunkResult = ThunkAction<void, ISharedState, unknown | undefined, ISharedActions>
export type ThunkStore = Store<ISharedState, ISharedActions> & {
  dispatch: ThunkDispatch<ISharedState, undefined, ISharedActions>;
}

export enum SiteRoles {
  ADMIN = "system:admin",
  DEMO = "public:demo",
  GUEST = "public:guest"
}

export type IChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type IFocusEvent = React.FocusEvent<HTMLTextAreaElement>;

export class ApiResponse {
  responseText?: string;
  responseString?: string;
  responseBody?: Response;
}

export interface CallApi {
  path?: string;
  method?: string;
  body?: string;
  cognitoUser: CognitoUser;
}

export interface ApiResponseBody {
  error: Error | string;
  type: string;
  message: string;
  statusCode: number;
  awsRequestId: string;
}

export interface DropFile {
  preview?: string;
  name?: string;
  size?: number;
}

export * from './cognito.d';
export * from './common.d';
export * from './lambda.d';
export * from './manage.d';
export * from './profile.d';