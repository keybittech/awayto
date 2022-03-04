import { AdminGetUserResponse } from '@aws-sdk/client-cognito-identity-provider';
import { IGroup } from 'awayto';
import { useMemo, useState } from 'react';

type StateAttr = ISharedState[keyof ISharedState];
type InferType<T> = T extends { [K in keyof StateAttr]: infer I } ? I : never;

type AllowedInputTypes = {
  string: string;
  number: number;
  groups: IGroup[];
  file: File;
  boolean: boolean;
  cognitoUser: AdminGetUserResponse;
}

type Constructed<T extends ISharedState[keyof ISharedState]> = {
  [K in keyof T]: InferType<K> extends keyof AllowedInputTypes[keyof AllowedInputTypes] ? AllowedInputTypes[keyof AllowedInputTypes][InferType<K>] : never
} | string

/**
 * `useForm` generates a simple set of inputs based off a given type
 * ```
 * import { useForm, IUserProfile } from 'awayto';
 * 
 * const [template, { name, email, age }] = useForm<IUserProfile>(); // Use name, email, age in your useEffects and event handlers.
 * 
 * return template;
 * ```
 * 
 * @category Hooks
 */

// export function useForm<T extends { [prop: string]: T }>(): [JSX.Element, T] {

//   type SharedType = (string | undefined | string[] | number) | T;

//   function isSharedState(attr?: SharedType): attr is T {
//     return !!(attr as T).mapped;
//   }

//   const [formAttrs, setFormAttrs] = useState<T>({} as T);

//   const attrs = useMemo<T>(() => new Proxy(formAttrs, {
//     get: function (target: T, prop: string) {
//       if (Object.getOwnPropertyNames(formAttrs).indexOf(prop) === -1)
//         setFormAttrs({ ...formAttrs, [prop]: '' })
//       return Reflect.get(target, prop) as T[keyof T];
//     },
//   }), [formAttrs]);

//   const template = useMemo(() => {
//     if (formAttrs && Object.keys(formAttrs).length) {
//       return <>
//         {Object.keys(formAttrs).map((attr, i) => {
//           const yep = <input name={attr} value={formAttrs[attr] as unknown as string} onChange={e => { setFormAttrs({ ...formAttrs, [attr]: e.target.value }) }} />;
//           // const inp = !isSharedState(formAttrs[attr] as SharedType) ?  : <>hi</>

//           return <span key={i}>
//             {attr}: {yep}
//           </span>
//         })}
//       </>
//     } else {
//       return <></>;
//     }
//   }, [formAttrs]);

//   return [template, attrs];
// }

// todo
export default {}