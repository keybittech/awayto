import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { IState } from '../types/index.d';

export const useRedux: TypedUseSelectorHook<IState> = useSelector;