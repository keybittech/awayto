import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export function Home({ classes }: IProps): JSX.Element {

  return <>
    <Card>
      <CardContent>
        <Typography variant="h5">Welcome!</Typography>
        <Typography variant="body1">This is a sandbox. Begin building your application by developing new modules. Check out the <Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://awayto.dev/start" }} target="_blank">Getting Started</Typography> and <Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://awayto.dev/faq" }} target="_blank">FAQ</Typography> guides to begin.</Typography>
      </CardContent>
    </Card>
  </>;
}

export default Home;
