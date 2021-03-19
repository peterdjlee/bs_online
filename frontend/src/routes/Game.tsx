import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';
import PlayerHand from '../components/PlayerHand';

const useStyles = makeStyles({
  title: {
    fontSize: "40px",
    marginBottom: "100px",
  },
  button: {
    fontSize: "20px",
    marginTop: "50px",
    marginBottom: "50px",
  },
  box: {
      marginTop: "50px"
  }
});

function Game(props: RouterProps) {
  const classes = useStyles();
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
          <Box
            className={classes.box}
            border={1}
            borderRadius="50%"
            borderColor="grey.400"
            flexDirection="row"
            display="flex"
            width="100vh"
            height="100vh">
        </Box>
        <PlayerHand></PlayerHand>
      <Button variant="contained" className={classes.button} color="primary">
        Submit
      </Button>
    </Box>
  )
}
export default withRouter(Game);
