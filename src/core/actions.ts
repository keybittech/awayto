import { MetaAction, PayloadAction } from './types/index.d';

export const createAction = <Type extends string, Meta>(type: Type, meta?: Meta): MetaAction<Type, Meta> =>
  ({ type, meta });

/**
 * 
 * @param type 
 * @param payload 
 * @param meta 
 * @returns 
 */
export const createPayloadAction = <Type extends string, Payload, Meta>(
  type: Type,
  payload: Payload,
  meta?: Meta,
): PayloadAction<Type, Payload, Meta> => ({
  ...createAction(type, meta),
  payload,
});

/**
 * <p>Act is used to call Redux actions.
 * 
 * ```
 * import { act } from 'awayto';
 * 
 * const { SET_SNACK } = IUtilActions;
 * 
 * const snack = {
 *  snackType: 'error',
 *  snackOn: 'Please log back in.'
 * };
 * 
 * act(SET_SNACK, snack);
 * ```
 * 
 * @param type {IActionTypes} The const form of an action type, i.e. GET_MANAGE_USERS
 * @param payload {ISharedState} The payload should match a partial of one of the state models.. IUtil, IUserProfile, etc..
 * @param meta {any} Unused. Could be used for passing auditing info.
 * @returns 
 */
export const act = createPayloadAction;