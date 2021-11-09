import 'typeface-roboto';
import 'typeface-courgette';

import React from 'react';
import MomentUtils from '@date-io/moment';
import { ConnectedRouter } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { asyncForEach, IReducers } from 'awayto';
import reportWebVitals from './reportWebVitals';

import { createElement } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';

import build from './build.json';

import './index.css';

import App from './App';

import { history, store, persistor, addReducer } from './redux';

/**
 * 
 * Awayto bootstrapping function. Loads module structure into redux then bootstraps react. This is done to support the dynamic module structure in general, which includes reducers.
 * 
 * The dev could potentially load the site on any given page which may use any given reducer. So the reducers should be loaded as they will perform the functionality to return any data which may be necessary for the React.lazy component to get past Suspense.
 * 
 * In the future, we want to be more intelligent about how to pick which reducer to load, but it's not a major optimization.
 * 
 * @category Awayto
 * @param renderComponent {JSX.Element} The typical element structure you would give when calling React's `render()`
 */
export async function awayto(renderComponent: JSX.Element): Promise<void> {

  const { reducers } = build as Record<string, Record<string, string>>;

  await asyncForEach(Object.keys(reducers), async (reducer: string): Promise<void> => {
    const r = await import('../webapp/modules/' + reducers[reducer]) as { default: IReducers };
    addReducer({ [reducer]: r.default });
  });

  const props = { store, loading: null, persistor };

  render(
    createElement(Provider, props,
      createElement(PersistGate, props,
        renderComponent
      )
    ), document.querySelector('#root')
  )

}

awayto(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </MuiPickersUtilsProvider>
).catch(console.error);

reportWebVitals(console.log);