import React, { ComponentType } from 'react';
import { RouterState } from 'connected-react-router';
import { RouteComponentProps } from 'react-router';
import { Action, ReducersMapObject, Store } from 'redux';
import { PersistState } from 'redux-persist';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { IStyles } from '../style';
import { CognitoUser } from '../cognito';

declare global {
  /**
   * @category Awayto
   */
  export interface ISharedState {
    root: ILoadedState;
    components: IBaseComponents;
    _persist: PersistState;
    router: RouterState<unknown>;
  }

  /**
   * @category Awayto
   */
  export type ISharedActions = ICommonModuleActions | IManageModuleActions | IProfileModuleActions;

  /**
   * @category Awayto
   */
  export type IProps = SafeRouteProps & {
    classes?: IStyles;
    closeModal: () => void;
  } & {
    [prop: string]: boolean | string | number | ILoadedState | (() => void);
  };
}

type RouteProps = { [prop: string]: string }
type SafeRouteProps = Omit<RouteComponentProps<RouteProps>, "staticContext">;

type Props = IProps & SafeRouteProps;

/**
 * @category Awayto
 */
export type IBaseComponent = ComponentType<Props>

/**
 * @category Awayto
 */
export type IBaseComponents = { [component: string]: IBaseComponent }

/**
 * @category Awayto
 */
export type TempComponent = IBaseComponent | string | undefined

/**
 * @category Awayto
 */
export type LazyComponentPromise = Promise<{ default: IBaseComponent }>

/**
 * @category Awayto
 */
export type IEmpty = undefined | null | void;

/**
 * @category Awayto
 */
export type ILoadedState = ISharedState[keyof ISharedState];

/**
 * @category Awayto
 */
export type IReducers = ReducersMapObject<ISharedState, ISharedActions>;

/**
 * @category Awayto
 */
export type ILoadedReducers = Partial<IReducers>;

/**
 * @category Awayto
 */
export type IActionTypes = ISharedActionTypes[keyof ISharedActionTypes];

/**
 * @category Awayto
 */
export type MetaAction<Type, Meta> = Action<Type> & {
  meta?: Meta;
};

/**
 * @category Awayto
 */
export type PayloadAction<Type, Payload, Meta = void> = MetaAction<Type, Meta> & {
  readonly payload: Payload;
};

/**
 * @category Awayto
 */
export type LogoutAction = PayloadAction<"LOGOUT", void>;

/**
 * @category Awayto
 */
export type ThunkResult = ThunkAction<void, ISharedState, unknown | undefined, ISharedActions>

/**
 * @category Awayto
 */
export type ThunkStore = Store<ISharedState, ISharedActions> & {
  dispatch: ThunkDispatch<ISharedState, undefined, ISharedActions>;
}

/**
 * @category Build
 * @param {string} n A path name returned from glob.sync
 * @returns An object like `{ 'MyComponent': 'common/views/MyComponent' }`
 */
export function buildPathObject(path: string): string;

/**
 * @category Build
 * @param {string} path A file path to a set of globbable files
 * @returns An object containing file names as keys and values as file paths.
 * @example
 * ```
 * {
 *   "views": {
 *     "Home": "common/views/Home",
 *     "Login": "common/views/Login",
 *     "Secure": "common/views/Secure",
 *   },
 *   "reducers": {
 *     "login": "common/reducers/login",
 *     "util": "common/reducers/util",
 *   }
 * }
 * ```
 */
export function parseResource(path: string): Record<string, string>;

/**
 * <p>This function runs on build and when webpack dev server receives a request.</p>
 * <p>Scan the file system for views and reducers and parse them into something we can use in the app.</p>
 * <p>Check against a hash of existing file structure to see if we need to update the build file. The build file is used later in the app to load the views and reducers.</p>
 * 
 * ```
 * // from config-overrides.js
 * 
 * function checkWriteBuildFile(next) {
 *   try {
 *     const files = JSON.stringify({
 *       views: parseResource('.' + AWAYTO_WEBAPP_MODULES + '/**\/views/*.tsx'),
 *       reducers: parseResource('.' + AWAYTO_WEBAPP_MODULES + '/**\/reducers/*.ts')
 *     });
 * 
 *     const newHash = crypto.createHash('sha1').update(Buffer.from(files)).digest('base64');
 * 
 *     if (oldHash != newHash) {
 *       oldHash = newHash;
 *       fs.writeFile(filePath, files, () => next && next())
 *     } else {
 *       next && next()
 *     }
 *   } catch (error) {
 *     console.log('error!', error)
 *   }
 * }
 * 
 * ```
 * @category Build
 * @param {app.next} next The next function from express app
 */
export function checkWriteBuildFile(next: () => unknown): void;






















/**
 * @category Awayto
 */
export enum SiteRoles {
  ADMIN = "system:admin",
  DEMO = "public:demo",
  GUEST = "public:guest"
}

/**
 * @category Awayto
 */
export type IChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

/**
 * @category Awayto
 */
export type IFocusEvent = React.FocusEvent<HTMLTextAreaElement>;

/**
 * @category Awayto
 */
export class ApiResponse {
  responseText?: string;
  responseString?: string;
  responseBody?: Response;
}

/**
 * @category Awayto
 */
export interface CallApi {
  path?: string;
  method?: string;
  body?: string;
  cognitoUser: CognitoUser;
}

/**
 * @category Awayto
 */
export interface ApiResponseBody {
  error: Error | string;
  type: string;
  message: string;
  statusCode: number;
  awsRequestId: string;
}

/**
 * @category Awayto
 */
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