import { Context } from 'aws-lambda'
import { PoolClient } from 'pg'
import { ILoadedState } from '.'

/**
 * @category Lambda
 */
export type ApiModule = {
  [name: string]: ApiModulet;
}

/**
 * @category Lambda
 */
export type ApiModulet = {
  groups?: string[];
  roles?: string[];
  path: string;
  cmnd(props: ApiProps, meta?: string): LambdaApiResponse | ILoadedState[] | boolean | Promise<LambdaApiResponse | ILoadedState[] | boolean>;
}

/**
 * @category Lambda
 */
export type ApiProps = {
  event: ApiEvent;
  context: Context;
  client: PoolClient; 
}

/**
 * @category Lambda
 */
export type ApiEvent = {
  [name: string]: unknown;
  body: Record<string, string | Record<string, unknown>> | ILoadedState;
  userSub: string;
  userAdmin: string;
  resource: string;
  httpMethod: string;
  query: Record<string, string>;
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
};

/**
 * @category Lambda
 */
export type LambdaApiResponse = {
  [name: string]: Record<string, unknown> | unknown[] | unknown;
}

/**
 * @category Lambda
 */
export type ApiRequestAuthorizer = {
  userToken: string,
  contentGroups?: string[],
  contentRoles?: string[],
}