import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';
import PlayerHand from '../components/PlayerHand';
import Table from '../components/Table';
import { PlayerContext } from '../util/player';

const useStyles = makeStyles({
  title: {
    fontSize: "40px",
    marginBottom: "100px",
  },
  button: {
    fontSize: "20px",
    marginTop: "50px",
    marginBottom: "50px",
  }
});

function Game(props: RouterProps) {
  const classes = useStyles();
  const player = useContext(PlayerContext);
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Table></Table>
      <Typography variant="h4">{player.nickname}'s hand:</Typography>
      <PlayerHand></PlayerHand>
      <Button variant="contained" className={classes.button} color="primary">
        Submit
      </Button>
    </Box>
  )
}
export default withRouter(Game);
