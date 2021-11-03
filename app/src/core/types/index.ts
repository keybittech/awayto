import React, { FunctionComponent } from 'react';
import { RouterState } from 'connected-react-router';
import { RouteComponentProps } from 'react-router';
import { Action, ReducersMapObject, Store } from 'redux';
import { PersistState } from 'redux-persist';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { CognitoUser } from '../cognito';

declare global {
  /**
   * @category Awayto Redux
   */
  interface ISharedState {
    components: IBaseComponents;
    _persist: PersistState;
    router: RouterState<unknown>;
  }

  /**
   * @category Awayto Redux
   */
  type ISharedActions =  ICommonModuleActions | IManageModuleActions | IProfileModuleActions;

  /**
   * @category Awayto React
   */
  interface IProps extends SafeRouteProps {
    classes: Record<string, string>;
    closeModal?: () => void;
    // [prop: string]: SiteRoles | ReactElement | SafeRouteProps[keyof SafeRouteProps] | undefined | boolean | string | number | ILoadedState | (() => void);
  }
}

type RouteProps = { [prop: string]: string }
type SafeRouteProps = Omit<RouteComponentProps<RouteProps>, "staticContext">;

/**
 * @category Awayto React
 */
export type IBaseComponent = FunctionComponent<IProps>

/**
 * @category Awayto React
 */
export type IBaseComponents = { [component: string]: IBaseComponent }

/**
 * @category Awayto React
 */
export type TempComponent = IBaseComponent | string | undefined

/**
 * @category Awayto React
 */
export type LazyComponentPromise = Promise<{ default: IBaseComponent }>

/**
 * @category Awayto Redux
 */
export type ILoadedState = ISharedState[keyof ISharedState];

/**
 * @category Awayto Redux
 */
export type IReducers = ReducersMapObject<ISharedState, ISharedActions>;

/**
 * @category Awayto Redux
 */
export type ILoadedReducers = Partial<IReducers>;

/**
 * @category Action Types
 */
export type IActionTypes = ISharedActionTypes[keyof ISharedActionTypes];

/**
 * @category Awayto Redux
 */
export type MetaAction<Type, Meta> = Action<Type> & {
  meta?: Meta;
};

/**
 * @category Awayto Redux
 */
export type PayloadAction<Type, Payload, Meta = void> = MetaAction<Type, Meta> & {
  readonly payload: Payload;
};

/**
 * @category Awayto Redux
 */
export type ThunkResult = ThunkAction<void, ISharedState, unknown | undefined, ISharedActions>

/**
 * @category Awayto Redux
 */
export type ThunkStore = Store<ISharedState, ISharedActions> & {
  dispatch: ThunkDispatch<ISharedState, undefined, ISharedActions>;
}

/**
 * @category Build
 * @param {string} n A path name returned from glob.sync
 * @returns An object like `{ 'MyComponent': 'common/views/MyComponent' }`
 */
export declare function buildPathObject(path: string): string;

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
export declare function parseResource(path: string): Record<string, string>;

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
export declare function checkWriteBuildFile(next: () => unknown): void;






















/**
 * @category Authorization
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
export interface IPreviewFile extends File {
  preview: string;
}

export * from './cognito';
export * from './common';
export * from './lambda';
export * from './manage';
export * from './profile';