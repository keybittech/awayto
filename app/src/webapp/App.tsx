import Icon from './img/kbt-icon.png';

import { History } from 'history';
import React, { Suspense, useEffect } from 'react';
import { Route, Redirect, withRouter, Switch } from 'react-router-dom';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import withStyles from '@material-ui/core/styles/withStyles'
import Toggle from '@material-ui/core/Switch'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Snackbar from '@material-ui/core/Snackbar'
import Toolbar from '@material-ui/core/Toolbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Backdrop from '@material-ui/core/Backdrop'
import AppBar from '@material-ui/core/AppBar'
import Link from '@material-ui/core/Link'

import { darkTheme, lightTheme, ILoginActionTypes, IUtilActionTypes, act, CognitoUserPool, styles, useRedux, useDispatch, useComponents } from 'awayto';

import './App.css';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';

function Alert(props: AlertProps): JSX.Element {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const {
  REACT_APP_COGNITO_USER_POOL_ID: UserPoolId,
  REACT_APP_COGNITO_CLIENT_ID: ClientId
} = process.env;

const { AUTH_DENIAL, AUTH_SUCCESS } = ILoginActionTypes;
const { SET_SNACK, SET_THEME } = IUtilActionTypes;

const App = (props: IProps): JSX.Element => {
  const { classes = {}, history = {} as History<unknown> } = props;
  const { Sidebar, ConfirmAction, Home, Profile, ChangeNewPassword, Login, Manage, SignUp, CompleteSignUp } = useComponents();

  const dispatch = useDispatch();
  const login = useRedux(state => state.login);
  const util = useRedux(state => state.util);
  const { snackOn, snackType, isLoading, loadingMessage, theme, hasSignUpCode } = util;

  const hideSnack = (): void => {
    dispatch(act(SET_SNACK, { snackOn: '' }));
  }

  useEffect(() => {
    const bootstrapped = true;

    if (!UserPoolId || !ClientId)
      throw new Error('Configuration error: userPoolId missing during callApi.');

    const pool = new CognitoUserPool({ UserPoolId, ClientId });
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser)
      dispatch(act(AUTH_DENIAL, { bootstrapped }));
    else
      dispatch(act(AUTH_SUCCESS, { bootstrapped, username: cognitoUser.getUsername() }))

  }, []);

  return <>
    <ThemeProvider theme={theme == 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Suspense fallback="">
        {login.bootstrapped ? <>
          {!!login.username ?
            <div className={classes.root}>
              <AppBar position="fixed" className={classes.appBar}>
                <Toolbar />
              </AppBar>
              <Sidebar {...props} />
              <main className={classes.content}>
                <div className={classes.toolbar} />
                <Switch>
                  {login.newPassRequired && <Redirect to="/" />}
                  {history.location.pathname === '/' && <Redirect to="/home" />}
                  <Route exact path="/home" component={Home} />
                  <Route exact path="/profile" component={Profile} />
                  <Route exact path="/manage/:component" component={Manage} />
                </Switch>
              </main>
            </div> :
            <main>
              <Grid container alignItems="center" direction="column">
                <Grid item>
                  <Grid container className={classes.loginWrap} alignItems="center" direction="column">

                    <Grid item xs={8}>
                      <Grid container alignItems="center" direction="row">
                        <img src={Icon} alt="keybit tech logo" className={classes.appLogo} />
                        <Typography variant="h3">&nbsp;AWAYTO</Typography>
                      </Grid>

                      <Grid container>
                        <Grid item xs={12}>
                          <Grid container justify="space-between">
                            <Typography><Link href="https://github.com/keybittech/awayto">View on GitHub</Link></Typography>
                            <Typography><Link href="https://awayto.dev/docs/index.html">Typedoc</Link></Typography>
                            <Typography><Link href="https://keybittech.com">KeyBit Tech</Link></Typography>
                            <Typography><Link href="https://discord.gg/KzpcTrn5DQ">Discord</Link></Typography>
                            <Typography><Link href="https://twitch.tv/awayto">Twitch</Link></Typography>
                            <Typography><Link href="https://twitter.com/awaytodev">Twitter</Link></Typography>
                            <Typography><Link href="mailto:joe@keybittech.com">Contact</Link></Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Switch>
                        {!['/', '/signup'].includes(history.location.pathname) && <Redirect to="/" />}
                        <Route exact path="/" component={login.newPassRequired ? ChangeNewPassword : Login} />
                        <Route exact path="/signup" component={hasSignUpCode ? CompleteSignUp : SignUp} />
                      </Switch>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <div style={{ position: 'fixed', bottom: 0, right: 0 }}>
                <FormControlLabel
                  value="darkmode"
                  control={
                    <Toggle
                      onClick={() => { dispatch(act(SET_THEME, { theme: theme === 'dark' ? 'light' : 'dark' })) }}
                      checked={theme === 'dark'}
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                  labelPlacement="end"
                />
              </div>
            </main>
          }
          {!!snackOn && <Snackbar open={!!snackOn} autoHideDuration={6000} onClose={hideSnack}>
            <Alert onClose={hideSnack} severity={snackType || "info"}>
              {snackOn}
            </Alert>
          </Snackbar>}
          {React.createElement(ConfirmAction, props)}
          <Backdrop className={classes.backdrop} open={!!isLoading} >
            <Grid container direction="column" alignItems="center">
              <CircularProgress color="inherit" />
              {loadingMessage ?? ''}
            </Grid>
          </Backdrop>
        </> :
          <Backdrop className={classes.backdrop} open={true} >
            <CircularProgress color="inherit" />
          </Backdrop>
        }
      </Suspense>
    </ThemeProvider>
  </>
}

export default withStyles(styles)(withRouter(App));
