import { AnyAction } from 'redux';
import { useDispatch as dispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IState } from '../types/index.d';
import { store } from '../redux';

export const useDispatch = (): ThunkDispatch<IState, undefined, AnyAction> => dispatch<typeof store.dispatch>();
