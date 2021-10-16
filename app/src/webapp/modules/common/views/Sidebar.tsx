import Icon from '../../../img/kbt-icon.png';

import { History } from 'history';
import React from 'react';
import { Grid, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import AppsIcon from '@material-ui/icons/Apps';

import { act, useDispatch, IUtilActionTypes } from 'awayto';

export function Sidebar (props: IProps): JSX.Element {
  const { classes = {}, history = {} as History } = props;

  const dispatch = useDispatch();

  const navigate = (link: string) => {
    history.push(link);
  }

  const logout = () => {
    logout();
    sessionStorage.clear();
    localStorage.clear();
    dispatch(act(IUtilActionTypes.CLEAR_REDUX, { username: '' }));
  }

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Grid container style={{ height: '100vh' }} alignContent="space-between">
        <Grid item xs={12} style={{ marginTop: '20px' }}>
          <Grid container justify="center">
            <img src={Icon} alt="kbt-icon" className={classes.logo} />
          </Grid>
          <List>
            <ListItem className={classes.menuIcon} onClick={() => navigate('/home')} button key={'home'}>
              <ListItemIcon><VpnKeyIcon color={history.location.pathname === '/home' ? "secondary" : "primary"} /></ListItemIcon>
              <ListItemText classes={{ primary: classes.menuText }}>Home</ListItemText>
            </ListItem>
            <ListItem className={classes.menuIcon} onClick={() => navigate('/manage/users')} button key={'manage'}>
              <ListItemIcon><AppsIcon color={history.location.pathname === '/manage/users' ? "secondary" : "primary"} /></ListItemIcon>
              <ListItemText classes={{ primary: classes.menuText }}>Manage</ListItemText>
            </ListItem>
          </List>
        </Grid>
        <Grid item xs={12}>
          <List>
            <ListItem className={classes.menuIcon} onClick={() => navigate('/profile')} button key={'profile'}>
              <ListItemIcon><AccountBoxIcon color={history.location.pathname === '/profile' ? "secondary" : "primary"} /></ListItemIcon>
              <ListItemText classes={{ primary: classes.menuText }}>Profile</ListItemText>
            </ListItem>
            <ListItem className={classes.menuIcon} onClick={logout} button key={'logout'}>
              <ListItemIcon><ExitToAppIcon color="primary" /></ListItemIcon>
              <ListItemText classes={{ primary: classes.menuText }}>Logout</ListItemText>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default Sidebar;