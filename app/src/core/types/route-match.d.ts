declare module 'route-match' {

  export type RouteMatch = {
    Route: Route;
    RouteCollection: RouteCollection;
    PathMatcher: PathMatcher;
    PathGenerator: PathGenerator;
  }

  export type Route = {
    new(key: string, path: string): Route;
    name: string;
    pattern: string;
    payload: Record<string, unknown>;
  }

  export type RouteCollection = {
    new(paths: Route[]): RouteCollection;
    routes: Route[];
  }

  export type PathMatcher = {
    new(rc: RouteCollection): PathMatcher;
    routeCollection: RouteCollection;
    match(path: string): PathMatch;
  }
  
  export type PathGenerator = {
    new(rc: RouteCollection): PathGenerator;
    routeCollection: RouteCollection;
    generate(path: string, params: Record<string, string>): string;
  }      

  export type PathMatch = {
    _route: string;
    _params: Record<string, string>;
  }
}