import { MetaAction, PayloadAction } from '.';

const createAction = <Type extends string, Meta>(type: Type, meta?: Meta): MetaAction<Type, Meta> =>
  ({ type, meta });

/**
 * Act is used to call Redux actions.
 * 
 * ```
 * import { act, IUtilActions } from 'awayto';
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
 * @category Awayto
 * @param type {@link IActionTypes} The const form of an action type, i.e. {@link IUtilActionTypes.SET_SNACK}
 * @param payload {@link ILoadedState} The payload should match at least a partial of one of the state models.. {@link IUtil}, {@link IUserProfile}, etc..
 * @param meta {any} Unused. Could be used for passing auditing info.
 * @returns {@link PayloadAction}
 */
export const act = <Type extends string, Payload, Meta>(
  type: Type,
  payload: Payload,
  meta?: Meta,
): PayloadAction<Type, Payload, Meta> => ({
  ...createAction(type, meta),
  payload,
});