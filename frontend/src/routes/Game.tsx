import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import PlayerHand from '../components/PlayerHand';
import Table, { WIDTH as TABLE_WIDTH, HEIGHT as TABLE_HEIGHT } from '../components/Table';
import { PlayerContext } from '../util/player';
import { SocketContext } from '../util/socket';
import { getCardString, rankString } from '../util/cards';

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
  const [turn, setTurn] = useState({ cardRank: 0, position: 0 });

  useEffect(() => {
    socket.on('UpdatePlayerHand', cards => {
      setHand(cards.sort((l, r) => l[0] - r[0]).map(getCardString));
    });
    socket.on('UpdateOtherHands', hands => setTable(hands));
    socket.on('StartTurn', turn => setTurn(turn));
    socket.emit('RequestGameInfo', { lobby_code: player.room });
  }, []);

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center">
      <Table hands={table} turn={turn.position} />
      <Box
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        position="absolute"
        top={0}>
        <Typography variant="h4">{rankString[turn.cardRank - 1]}</Typography>
        <Box textAlign="center" p={4}>
          <Card height={100} back />
          <Typography>n cards</Typography>
        </Box>
        <Button variant="contained" color="primary">Call BS</Button>
      </Box>
      <Typography variant="h4">{player.nickname}'s hand:</Typography>
      <Box width={TABLE_WIDTH}>
        <PlayerHand cards={hand} />
      </Box>
      <Button variant="contained" className={classes.button} color="primary">
        Submit
      </Button>
    </Box>
  )
}
export default withRouter(Game);
