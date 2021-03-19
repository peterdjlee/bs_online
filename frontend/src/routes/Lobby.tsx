import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography, Divider } from '@material-ui/core';
import { SocketContext } from '../util/socket';
import { PlayerContext } from '../util/player';
import { RouterProps, withRouter } from 'react-router-dom';

const useStyles = makeStyles({
  subtitle: {
    fontSize: "20px",
    marginTop: "20px",
    marginBottom: "20px"
  },
  link: {
    fontSize: "15px",
    marginLeft: "10px",
    marginTop: "5px",
    marginBottom: "5px"
  },
  copyButton: {
    fontSize: "15px",
  },
  title: {
    fontSize: "40px",
    marginTop: "80px"
  },
  divider: {
    width: "400px",
    height: "2px",
    backgroundColor: "gray.600",
    marginTop: "10px",
    marginBottom: "20px"
  },
  player: {
    fontSize: "20px",
    marginTop: "5px",
  },
  startButton: {
    fontSize: "18px",
  },
});

function Lobby(props: RouterProps) {
  const classes = useStyles();
  const [players, setPlayers] = useState([]);
  const player = useContext(PlayerContext);
  const socket = useContext(SocketContext);
  const gameLink = window.location.host + "/join/" + player.room;
  useEffect(() => {
    if (player.nickname === '' || player.room === '') {
      props.history.push('/');
    } else {
      socket.on('ret/lobbies/addPlayer', json =>
        setPlayers(json.players.map(p => p.nickname)));
      socket.emit('api/lobbies/addPlayer', {
        lobby_code: player.room,
        nickname: player.nickname
      });
    }
  }, []);
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center">
      <Typography className={classes.subtitle}>Invite</Typography>
      <Box
        border={1}
        borderRadius="borderRadius"
        borderColor="grey.400"
        flexDirection="row"
        display="flex"
        width="300px">
        <Box width="100vh"
          display="flex"
          alignItems="center">
          <Typography className={classes.link}>{gameLink}</Typography>
        </Box>
        <Box
          borderLeft={1}
          borderColor="grey.400"
          alignItems="center"
          display="flex">
          <Button
            color="primary"
            className={classes.copyButton}
            onClick={() => { navigator.clipboard.writeText(gameLink) }}>
            Copy
          </Button>
        </Box>
      </Box>
      <Box
        height="450px"
        display="flex"
        flexDirection="column"
        alignItems="center">
        <Typography className={classes.title}>Players</Typography>
        <Divider className={classes.divider} orientation="horizontal"></Divider>
        {players.map((player, i) => <Typography key={i} className={classes.player}>{player}</Typography>)}
      </Box>
      <Button variant="contained" color="primary" className={classes.startButton}>
        Start Game
      </Button>
    </Box>
  )
}

export default withRouter(Lobby);
