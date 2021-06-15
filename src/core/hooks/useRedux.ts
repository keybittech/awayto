import { TypedUseSelectorHook, useSelector } from 'react-redux';

export const useRedux: TypedUseSelectorHook<ISharedState> = useSelector;