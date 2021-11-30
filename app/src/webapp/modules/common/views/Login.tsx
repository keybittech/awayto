import React, { FormEvent, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { ILoginActionTypes, cognitoSSRPLogin, IUtilActionTypes } from 'awayto';
import { useRedux, useAct, useComponents } from 'awayto-hooks';

const { RESET_PASSWORD, LOGIN_USER, AUTH_DENIAL } = ILoginActionTypes;
const { SET_SNACK, START_LOADING, STOP_LOADING } = IUtilActionTypes;

export function Login(props: IProps): JSX.Element {
  const { classes } = props;

  const { SignUp } = useComponents();

  const act = useAct();
  const login = useRedux(state => state.login);

  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitForm = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    act(START_LOADING, { isLoading: true });
    try {
      const { ChallengeName, Session } = await cognitoSSRPLogin(username, password);
      if (ChallengeName)
        act(RESET_PASSWORD, { username, challengeName: ChallengeName, session: Session });
      else
        act(LOGIN_USER, { username, isLoggedIn: true });
    } catch (error) {
      const { message } = error as Error;
      act(SET_SNACK, { snackType: 'error', snackOn: `Error while submitting login form: ${message}` })
      act(AUTH_DENIAL, { error: message });
    } finally {
      act(STOP_LOADING, { isLoading: false });
    }
  }, [username, password]);

  const getContent = (): JSX.Element => (
    <Grid item xs={12} md={9}>
      <Card>
        <CardContent>

          <Typography variant="h4">Watch the video</Typography>

          <iframe style={{ border: 'none', width: '100%', maxWidth: '560px', height: '315px' }} src="https://www.youtube.com/embed/GKsvr3KkF4E" title="YouTube video player Awayto 2-Minute Introduction" allow="accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          <Typography variant="h6">Inquiries: <Typography variant="h5" className={classes.link} color="secondary" component={Link} to={{ pathname: "mailto:joe@keybittech.com" }} target="_blank">joe@keybittech.com</Typography></Typography>
          
          <Typography variant="h6">Ready to start?</Typography>
          <Typography variant="body1">Check out the <Typography className={classes.link} color="secondary" component={Link} to="/start">Getting Started</Typography> and <Typography className={classes.link} color="secondary" component={Link} to="/faq">FAQ</Typography> pages.</Typography>
          
          <Typography variant="h6">Still have questions?</Typography>
          <Typography variant="body1"><Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://discord.gg/KzpcTrn5DQ" }} target="_blank">Join the discord!</Typography></Typography>

          <Typography variant="h6">What is this?</Typography>
          <Typography>
            Deploy a fully-featured application in about 10 minutes that is primed for quick development. Do business, impress a client with a quick demo, finish your poc with time to spare; all easily achievable with Awayto. Managing the infrastructure for web applications is often cumbersome and time consuming. Awayto can be thought of as a method for working with web applications, laying out each step, should you care to change something.
          </Typography>

          <Typography variant="body1">
            There are a few tenets of Awayto:
          </Typography>

          <List>
            <ListItem className="bullet">
              Enhance the developer experience
            </ListItem>
            <ListItem className="bullet">
              Provide opportunities for developers to learn
            </ListItem>
            <ListItem className="bullet">
              Minimal focus on deployment, managed centrally
            </ListItem>
            <ListItem className="bullet">
              Use conventions that compliment functionality
            </ListItem>
          </List>

          <Typography variant="body1">
            The Awayto platform adheres to these tenets in part by being scalable, lightweight, and informative in its formation. The goal is to be a central platform that uses a precise and opinionated toolset to unite web, mobile, and IoT technologies. Developers and businesses alike can enjoy the many tools offered by Awayto:
          </Typography>

          <List>
            <ListItem className="bullet">
              Rapidly deployable environment using enterprise level technologies
            </ListItem>
            <ListItem className="bullet">
              Full scale business application built with business owners in mind
            </ListItem>
            <ListItem className="bullet">
              Robust user management system allowing for self signup, federated IdP, SAML, or admin generated memberships
            </ListItem>
            <ListItem className="bullet">
              Baked in group and role authorization framework
            </ListItem>
            <ListItem className="bullet">
              Fully-typed development environment using Typescript; use the same types on the full stack
            </ListItem>
            <ListItem className="bullet">
              Database schema designed for auditing and reporting
            </ListItem>
          </List>

        </CardContent>
      </Card>

    </Grid>

  )

  return login ?
    <form onSubmit={submitForm}>
      <Grid container spacing={4} direction="row-reverse">

        <Grid item xs={12} md={3}>
          <Grid container direction="column" justifyContent="flex-start" alignItems="stretch" spacing={4}>
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
              <Grid container justifyContent="space-between">
                <SignUp {...props} signUpButton />
                <Button type="submit" color="primary">Login</Button>
              </Grid>
            </Grid>
          </Grid>
          {login.error && <Typography color="error">{login.error}</Typography>}
        </Grid>

        {getContent()}

      </Grid>
    </form> :
    <></>
}

export default Login;