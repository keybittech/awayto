// import { Context } from 'aws-lambda'
// import { PoolClient } from 'pg'
import { IState } from '.'

export type ApiModule = {
  [name: string]: ApiModulet;
}

export type ApiModulet = {
  groups?: string[];
  roles?: string[];
  path: string;
  cmnd(props: ApiProps, meta?: string): Promise<LambdaApiResponse | ISharedState[keyof ISharedState][] | boolean>;
}

export type ApiProps = {
  event: ApiEvent;
  // context: Context;
  // client: PoolClient; 
}

export type ApiEvent = {
  [name: string]: unknown;
  body: Record<string, string | IState[] | Record<string, unknown>> | ISharedState[keyof ISharedState];
  userSub: string;
  query: Record<string, string>;
  pathParameters: Record<string, string>;
  queryStringParameters: Record<string, string>;
};

export type LambdaApiResponse = {
  [name: string]: Record<string, unknown> | unknown[] | unknown;
}

export type ApiRequestAuthorizer = {
  userToken: string,
  contentGroups?: string[],
  contentRoles?: string[],
}