import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';

const useStyles = makeStyles({
  title: {
    fontSize: "40px",
    marginBottom: "100px",
  }
});

function Home(props: RouterProps) {
  const classes = useStyles();
  const onCreate = () => {
    fetch('/api/lobbies/create', { method: 'POST' })
      .then(res => res.json())
      .then(json => props.history.push(`/join/${json.lobby_code}`));
  }
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Typography className={classes.title}>BS Online</Typography>
      <Button onClick={onCreate} variant="contained" color="primary">
        Create a Game
      </Button>
    </Box>
  )
}
export default withRouter(Home);
