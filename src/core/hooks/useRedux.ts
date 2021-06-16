import { TypedUseSelectorHook, useSelector } from 'react-redux';

/**
 * @category Hooks
 */
export const useRedux: TypedUseSelectorHook<ISharedState> = useSelector;