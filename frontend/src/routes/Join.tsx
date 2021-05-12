import React, { FormEvent, useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography, TextField } from '@material-ui/core';
import { RouterProps, useParams, withRouter } from 'react-router-dom';
import { PlayerContext } from '../util/player';
import { NotificationContext } from '../util/notification';

const useStyles = makeStyles({
  title: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  textfield: {
    fontSize: "20px",
    marginBottom: "100px",
  }
});

function Join(props: RouterProps) {
  const classes = useStyles();
  const [nickname, setNickname] = useState('');
  const { room } = useParams<{ room: string }>();
  const player = useContext(PlayerContext);
  const setNotification = useContext(NotificationContext);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nick = nickname.trim();
    const excluded = ['you', 'Admin'];

    if (nick === '') return;
    else if (nick.length > 10) {
      setNotification(`Nickname of length ${nick.length} too long (max 10)`);
      return;
    } else if (excluded.includes(nick)) {
      setNotification(`${nick} is not an allowed nickname`);
      return;
    }
    
    player.nickname = nick;
    player.room = room;
    props.history.push(`/lobby`);
  }

  return (
    <form onSubmit={onSubmit}>
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center">
        <Typography className={classes.title}>Enter your name</Typography>
        <TextField
          className={classes.textfield}
          label="Nickname"
          variant="outlined"
          autoFocus
          onChange={event => setNickname(event.target.value)} />
        <Button type="submit" variant="contained" color="primary">
          Join Game
      </Button>
      </Box>
    </form>
  )
}
export default withRouter(Join);
