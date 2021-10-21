import React from 'react';
import MomentUtils from '@date-io/moment';
import { ConnectedRouter } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { history, awayto } from 'awayto';
import reportWebVitals from './reportWebVitals';

import './index.css';

import App from './App'

awayto(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </MuiPickersUtilsProvider>
).catch(console.error);

reportWebVitals(console.log);