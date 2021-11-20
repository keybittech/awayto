import { Context } from 'aws-lambda'
import { PoolClient } from 'pg'
import { ILoadedState } from '.'

/**
 * @category API
 */
export type ApiModule = {
  [name: string]: ApiModulet;
}

/**
 * @category API
 */
export type ApiModulet = {
  roles?: string;
  inclusive?: boolean;
  path: string;
  cmnd(props: ApiProps, meta?: string): LambdaApiResponse | ILoadedState[] | boolean | Promise<LambdaApiResponse | ILoadedState[] | boolean>;
}

/**
 * @category API
 */
export type ApiProps = {
  event: ApiEvent;
  context: Context;
  client: PoolClient; 
}

/**
 * @category API
 */
export type ApiEvent = {
  [name: string]: unknown;
  body: Record<string, string | Record<string, unknown>> | ILoadedState;
  script: string;
  userSub: string;
  userAdmin: string;
  resource: string;
  httpMethod: string;
  query: Record<string, string>;
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
};

/**
 * @category API
 */
export type LambdaApiResponse = {
  [name: string]: Record<string, unknown> | unknown[] | unknown;
}

/**
 * @category API
 */
export type ApiRequestAuthorizer = {
  userToken: string;
  roles: string;
  inclusive: boolean;
}