import React from 'react';
import { IUtilActionTypes } from 'awayto';
import { useAct } from '../../../hooks';
import { Grid, Typography, Box } from '@material-ui/core';

const { SET_THEME } = IUtilActionTypes;

declare global {
  interface IProps {
    showTitle?: boolean;
  }
}

export function PickTheme ({ showTitle = true, classes }: IProps): JSX.Element {
  const act = useAct();

  const edit = (e: React.SyntheticEvent) => {
    act(SET_THEME, { theme: e.currentTarget.id });
  };

  return <>
    <Grid container alignItems="center">
      {showTitle ? <Grid item><Typography>Theme</Typography></Grid> : <></>}
      <Grid item onClick={edit} id="dark"><Box bgcolor="gray" className={classes.colorBox} /></Grid>
      <Grid item onClick={edit} id="light"><Box bgcolor="white" className={classes.colorBox} /></Grid>
      <Grid item onClick={edit} id="blue"><Box bgcolor="deepskyblue" className={classes.colorBox} /></Grid>
    </Grid>
  </>
}

export default PickTheme;