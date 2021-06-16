import React, { FormEvent, useState, useCallback } from 'react';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
// import Link from '@material-ui/core/Link'


import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { act, ILoginActionTypes, cognitoSSRPLogin, useRedux, useDispatch, useComponents, IUtilActionTypes } from 'awayto';

const { RESET_PASSWORD, LOGIN_USER, AUTH_DENIAL } = ILoginActionTypes;
const { SET_SNACK, START_LOADING, STOP_LOADING } = IUtilActionTypes;

export function Login(props: IProps): JSX.Element {
  // const { classes = {} } = props;
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
        dispatch(act(RESET_PASSWORD, { newPassRequired: true }));
      else
        dispatch(act(LOGIN_USER, { username }));
    } catch (error) {
      dispatch(act(SET_SNACK, { snackType: 'error', snackOn: `Error while submitting login form ${error as string}.` }))
      dispatch(act(AUTH_DENIAL, { error: error as string }));
    } finally {
      dispatch(act(STOP_LOADING, { isLoading: false }));
    }
  }, [username, password]);

  return login ?
    <form onSubmit={submitForm}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Grid container direction="column" justify="flex-start" alignItems="stretch" spacing={4}>
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
          </Grid>
        </Grid>

        {login.error && <Typography color="error">{login.error}</Typography>}

        <Grid item xs={12} md={9}>

          <Typography>
            Awayto is a workflow enhancing platform, producing great value with minimal investment. With all the ways there are to reach a solution, it's important to understand the landscape. The right path is a way to be discovered.
          </Typography>

          <Typography>
            There are a few tenants of Awayto:
          </Typography>

          <List>
            <ListItem>
              Enhance the developer experience
            </ListItem>
            <ListItem>
              Minimal focus on deployment, managed centrally
            </ListItem>
            <ListItem>
              Provide opportunities for developers to learn
            </ListItem>
            <ListItem>
              Use conventions that compliment functionality
            </ListItem>
          </List>

          <Typography>
            The Awayto platform adheres to these tenants in part by being scalable, lightweight, and secure. The goal is to be a central platform that uses a precise and opinionated toolset to unite web, mobile, and IoT technologies. Developers and businesses alike can enjoy the many tools offered by Awayto:
          </Typography>

          <List>
            <ListItem>
              Rapidly deployable environment using enterprise level technologies
            </ListItem>
            <ListItem>
              Full scale business application built with business owners in mind
            </ListItem>
            <ListItem>
              Robust user management system allowing for self signup, federated IdP, or admin generated memberships
            </ListItem>
            <ListItem>
              Baked in group and role authorization framework
            </ListItem>
            <ListItem>
              A fully typed Typescript development environment
            </ListItem>
            <ListItem>
              Curated set of database scripts designed with auditing and reporting in mind
            </ListItem>
          </List>

        </Grid>
      </Grid>
    </form> :
    <></>
}

export default Login;