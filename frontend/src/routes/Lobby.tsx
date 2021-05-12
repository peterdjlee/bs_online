import React, { useContext, useEffect, useState } from 'react';
import { Input, makeStyles, TextField } from '@material-ui/core';
import { Box, Button, Typography, Divider } from '@material-ui/core';
import { SocketContext } from '../util/socket';
import { PlayerContext } from '../util/player';
import { RouterProps, withRouter } from 'react-router-dom';
import { NotificationContext } from '../util/notification';
import Chat from '../components/Chat';

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
  activePlayer: {
    fontSize: "20px",
    marginTop: "5px",
    fontWeight: "bold",
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
  const setNotification = useContext(NotificationContext);
  const [newName, setNewName] = useState(player.nickname);

  const gameLink = window.location.host + "/join/" + player.room;
  const handleStartGame = () => {
    socket.emit('CreateGame', {
      lobby_code: player.room
    });
  }

  const changeName = e => {
    e.preventDefault();

    const nick = newName.trim();
    const excluded = ['you', 'Admin'];

    if (nick === '') return;
    else if (nick.length > 10) {
      setNotification(`Nickname of length ${nick.length} too long (max 10)`);
      return;
    } else if (excluded.includes(nick)) {
      setNotification(`${nick} is not an allowed nickname`);
      return;
    }

    socket.emit('ChangePlayerName', {
      nickname: newName,
      lobby_code: player.room
    });
    player.nickname = newName;
  }

  useEffect(() => {
    if (player.nickname === '' || player.room === '') {
      props.history.push('/');
    } else {
      socket.on('UpdatePlayerList', json =>
        setPlayers(json.player_names));
      socket.on('AddPlayerError', json => {
        setNotification(json.msg);
        props.history.goBack();
      });
      socket.on('StartGame', () => {
        socket.emit('OpenBSSockets');
        props.history.push('/play');
      });
      socket.on('ChangePlayerNameError', err => {
        setNotification(err.msg);
        player.nickname = err.old_name;
      });
      const resetLobby = props.history.location.state;
      if (!resetLobby) {
        socket.emit('AddPlayer', {
          lobby_code: player.room,
          nickname: player.nickname
        });
      }
    }
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-evenly">
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
              onClick={() => navigator.clipboard.writeText(gameLink)}>
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
          {players.map((p, i) => (
            <Typography
              key={i}
              className={player.nickname === p ? classes.activePlayer : classes.player}>
              {p}
            </Typography>
          ))}
          <form onSubmit={changeName}>
            <Box display="flex">
              <TextField
                onChange={e => setNewName(e.target.value)}
                label="Change nickname"
                variant="outlined" />
              <Button
                type="submit"
                className={classes.startButton}
                variant="contained"
                color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Box>
        <Button
          variant="contained"
          color="primary"
          className={classes.startButton}
          onClick={handleStartGame}>
          Start Game
        </Button>
      </Box>
      <Chat />
    </Box>
  )
}

export default withRouter(Lobby);
