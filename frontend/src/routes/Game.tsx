import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';
import PlayerHand from '../components/PlayerHand';
import Table from '../components/Table';
import { PlayerContext } from '../util/player';
import { SocketContext } from '../util/socket';
import { getCardString } from '../util/cards';

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
  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);
  const [hand, setHand] = useState<string[]>([]);
  const [table, setTable] = useState<object[]>([]);

  useEffect(() => {
    socket.on('UpdatePlayerHand', cards => {
      setHand(cards.sort((l, r) => l[0] - r[0]).map(getCardString));
    });
    socket.on('UpdateOtherHands', hands => setTable(hands));
    socket.on('StartTurn', console.log);
    socket.emit('RequestGameInfo', { lobby_code: player.room });
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Table hands={table} />
      <Typography variant="h4">{player.nickname}'s hand:</Typography>
      <Box width={1000}>
        <PlayerHand cards={hand} />
      </Box>
      <Button variant="contained" className={classes.button} color="primary">
        Submit
      </Button>
    </Box>
  )
}
export default withRouter(Game);
