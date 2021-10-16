import React, { Suspense } from 'react';
import MomentUtils from '@date-io/moment';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { ConnectedRouter } from 'connected-react-router';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { darkTheme, lightTheme, history, awayto } from 'awayto';
import reportWebVitals from './reportWebVitals';

import './index.css';

import App from './App'

awayto(
  <ThemeProvider theme={localStorage.getItem('kbt_theme') == 'light' ? { ...lightTheme } : { ...darkTheme }}>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <CssBaseline />
      <ConnectedRouter history={history}>
        <Suspense fallback="">
          <App />
        </Suspense>
      </ConnectedRouter>
    </MuiPickersUtilsProvider>
  </ThemeProvider>
).catch(console.error);

reportWebVitals(console.log);