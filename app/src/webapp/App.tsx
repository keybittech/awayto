import Icon from './img/kbt-icon.png';

import React, { Suspense, useEffect } from 'react';
import { Route, Redirect, withRouter, Switch } from 'react-router-dom';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { Skeleton } from '@material-ui/lab';

import withStyles from '@material-ui/core/styles/withStyles'
import Drawer from '@material-ui/core/Drawer';
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

import { ILoginActionTypes, IUtilActionTypes, CognitoUserPool } from 'awayto';
import { useRedux, useAct, useComponents } from 'awayto-hooks';

import './App.css';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline } from '@material-ui/core';
import { themes, styles } from './style';

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

  const { classes, history } = props;

  const { Sidebar, ConfirmAction, Home, Profile, ChangeNewPassword, Login, Manage, SignUp, CompleteSignUp, PickTheme } = useComponents();

  const act = useAct();
  const login = useRedux(state => state.login);
  const util = useRedux(state => state.util);
  const { snackOn, snackType, isLoading, loadingMessage, theme, hasSignUpCode } = util;

  const hideSnack = (): void => {
    act(SET_SNACK, { snackOn: '' });
  }

  useEffect(() => {
    const bootstrapped = true;

    if (!UserPoolId || !ClientId)
      throw new Error('Configuration error: userPoolId missing during callApi.');

    const pool = new CognitoUserPool({ UserPoolId, ClientId });
    const cognitoUser = pool.getCurrentUser();

    if (!cognitoUser)
      act(AUTH_DENIAL, { bootstrapped });
    else
      act(AUTH_SUCCESS, { bootstrapped, username: cognitoUser.getUsername() });

  }, []);

  return <>
    <ThemeProvider theme={themes[theme || 'dark']}>
      <CssBaseline />

      {login.bootstrapped ? <>
        {!!login.username ?
          <div className={classes.root}>
            <AppBar position="fixed" className={classes.appBar}>
              <Toolbar />
            </AppBar>
            <Suspense fallback={
              <Drawer className={classes.drawer} variant="permanent" classes={{ paper: classes.drawerPaper }} >
                <Grid container style={{ height: '100vh' }} alignContent="space-between">
                  <Grid item xs={12} style={{ marginTop: '20px' }}>
                    <Grid container justifyContent="center">
                      <img src={Icon} alt="kbt-icon" className={classes.logo} />
                    </Grid>
                    <Grid container style={{ padding: '10px' }}>
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="100%" />
                      <Skeleton variant="text" width="100%" />
                    </Grid>
                  </Grid>
                </Grid>
              </Drawer>
            }>
              <Sidebar {...props} />
            </Suspense>
            <main className={classes.content}>
              <div className={classes.toolbar} />
              <Suspense fallback={
                <Grid container>
                  <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar />
                  </AppBar>
                  <Grid container spacing={4} style={{ padding: '20px 20px 40px' }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="rect" width="100%" height="150px" animation="pulse" />
                  </Grid>
                  <Grid container spacing={4} style={{ padding: '20px' }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="rect" width="100%" height="150px" animation="pulse" />
                  </Grid>
                </Grid >
              }>
                <Switch>
                  {login.newPassRequired && <Redirect to="/" />}
                  {history.location.pathname === '/' && <Redirect to="/home" />}
                  <Route exact path="/home" render={() => <Home {...props} />} />
                  <Route exact path="/profile" render={() => <Profile {...props} />} />
                  <Route exact path="/manage/:component" render={({ match }) => <Manage {...props} view={match.params.component} />} />
                </Switch>
              </Suspense>
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
                        <Grid container justifyContent="space-between">
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
                    <Suspense fallback={
                      <Grid container style={{ padding: '15px 50px' }}>
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="rect" width="100%" height="150px" />
                      </Grid>
                    }>
                      <Switch>
                        {!['/', '/signup'].includes(history.location.pathname) && <Redirect to="/" />}
                        <Route exact path="/" render={() => login.newPassRequired ? <ChangeNewPassword {...props} /> : <Login {...props} />} />
                        <Route exact path="/signup" render={() => hasSignUpCode ? <CompleteSignUp {...props} /> : <SignUp {...props} />} />
                      </Switch>
                    </Suspense>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Suspense fallback="">
              <div style={{ position: 'fixed', bottom: 0, right: 0 }}>
                <PickTheme {...props} showTitle={false} />
              </div>
            </Suspense>
          </main>
        }
        {!!snackOn && <Snackbar open={!!snackOn} autoHideDuration={6000} onClose={hideSnack}>
          <Alert onClose={hideSnack} severity={snackType || "info"}>
            {snackOn}
          </Alert>
        </Snackbar>}
        <Suspense fallback="">
          <ConfirmAction {...props} />
        </Suspense>
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
    </ThemeProvider>
  </>
}

export default withStyles(styles)(withRouter(App));
