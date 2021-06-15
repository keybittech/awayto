import React, { Suspense } from 'react';
import MomentUtils from '@date-io/moment';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ConnectedRouter } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { darkTheme, lightTheme, history, awaytodev } from 'awaytodev';
import reportWebVitals from './reportWebVitals';

console.log('========================', process.env)

import './index.css';

import App from './App'

awaytodev(
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
).catch(console.error);

reportWebVitals(console.log);