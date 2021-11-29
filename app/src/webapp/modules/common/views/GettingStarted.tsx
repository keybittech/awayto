import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export function GettingStarted (props: IProps): JSX.Element {
  return <>
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h5">Getting Started</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Prerequisites</Typography>
            <Typography variant="subtitle1">AWS Administrator with CLI installed</Typography>
            <Typography variant="subtitle1">Python</Typography>
            <Typography variant="subtitle1">Postgres</Typography>
            <Typography variant="subtitle1">Node</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Prerequisites</Typography>
            <Typography variant="subtitle1">AWS Administrator with CLI installed</Typography>
            <Typography variant="subtitle1">Python</Typography>
            <Typography variant="subtitle1">Postgres</Typography>
            <Typography variant="subtitle1">Node</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </>
}

export default GettingStarted;