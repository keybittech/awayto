import React, { FormEvent, useState, useCallback } from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'


import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { act, IActions, ILoginActionTypes, cognitoSSRPLogin, useRedux, useDispatch, useComponents, IUtilActionTypes } from 'awaytodev';

const { RESET_PASSWORD, LOGIN_USER, AUTH_DENIAL } = ILoginActionTypes;
const { SET_SNACK, START_LOADING, STOP_LOADING } = IUtilActionTypes;

export function Login (props: Props): JSX.Element {
  const { SignUp } = useComponents();
  const dispatch = useDispatch();
  const login = useRedux(state => state.login);

  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    dispatch(act(START_LOADING, { isLoading: true }));
    try {
      const ChallengeName = await cognitoSSRPLogin(username, password);
      if (ChallengeName)
        dispatch(act(RESET_PASSWORD, { newPassRequired: true }) as IActions);
      else
        dispatch(act(LOGIN_USER, { username }) as IActions);
    } catch (error) {
      dispatch(act(SET_SNACK, { snackType: 'error', snackOn: `Error while submitting login form ${error as string}.` }))
      dispatch(act(AUTH_DENIAL, { error: error as string }) as IActions);
    } finally {
      dispatch(act(STOP_LOADING, { isLoading: false }));
    }
  }, [username, password]);

  return login ?
    <form onSubmit={submitForm}>
      <Grid container direction="column" alignItems="stretch" spacing={2}>
        <Grid item>
          <TextField
            fullWidth
            id="username"
            label="Username"
            value={username}
            name="username"
            onChange={e => setUsername(e.target.value)}
          />
        </Grid>

        <Grid item>
          <TextField
            fullWidth
            id="password"
            label="Password"
            value={password}
            name="password"
            onChange={e => setPassword(e.target.value)}
            type={showPass ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item>
          <Grid container justify="space-between">
            <SignUp {...props} signUpButton />
            <Button type="submit" color="primary">Login</Button>
          </Grid>
        </Grid>

        {login.error && <Typography color="error">{login.error}</Typography>}

      </Grid>
    </form> :
    <></>
}

export default Login;