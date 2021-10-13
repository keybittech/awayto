import React, { Suspense, lazy } from 'react';
import { render } from 'react-dom';
import MomentUtils from '@date-io/moment';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ConnectedRouter, connectRouter } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { darkTheme, lightTheme, setHistory, history, getStore, getPersistor, build, addReducer, components, LazyComponentPromise, asyncForEach, IReducers } from 'awayto';
import { createBrowserHistory } from 'history';
import reportWebVitals from './reportWebVitals';

import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import './index.css';

import 'typeface-roboto';
import 'typeface-courgette';

import App from './App'

(async function(){

  setHistory(createBrowserHistory());

  const store = getStore(history);
  const persistor = getPersistor(store);

  addReducer(store, {
    router: connectRouter(history)
  })

  const { views } = build as Record<string, Record<string, string>>;
  
  Object.keys(views).forEach((view: string): void => {
    components[view] = lazy((): LazyComponentPromise => import(/* webpackChunkName: "[request]" */ `../webapp/modules/${views[view]}`) as LazyComponentPromise)
  })
  
  const { reducers } = build as Record<string, Record<string, string>>;
  
  await asyncForEach(Object.keys(reducers), async (reducer: string): Promise<void> => {
    const r = await import('../webapp/modules/' + reducers[reducer]) as { default: IReducers };
    addReducer(store, { [reducer]: r.default });
  });

  const props = { store, loading: null, persistor };
  
  render(
    <Provider {...props}>
      <PersistGate {...props}>
        <ThemeProvider theme={localStorage.getItem('kbt_theme') == 'light' ? { ...lightTheme } : { ...darkTheme }}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <CssBaseline />
            <ConnectedRouter history={history}>
              <Suspense fallback="loading....">
                <App />
              </Suspense>
            </ConnectedRouter>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>, document.querySelector('#root')
  )
  
  reportWebVitals(console.log);
})().catch(console.error)