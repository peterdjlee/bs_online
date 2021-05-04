import React, { useContext, useEffect, useState } from "react";
import { Box, Button, makeStyles, TextField, Typography } from "@material-ui/core";
import { SocketContext } from "../util/socket";
import { PlayerContext } from "../util/player";

const useStyles = makeStyles({
  emoji: {
    fontSize: '2em'
  }
});

function Chat() {
  const classes = useStyles();

  const socket = useContext(SocketContext);
  const player = useContext(PlayerContext);

  const [input, setInput] = useState('');
  const [chatMsgs, setChatMsgs] = useState<{ name: string, msg: string }[]>([]);

  useEffect(() => {
    socket.on('ChatMessage', msg => setChatMsgs([...chatMsgs, msg]));
  }, [chatMsgs]);

  const send = e => {
    e.preventDefault();
    socket.emit('SendChat', {
      lobby_code: player.room,
      msg: input
    })
    setInput('');
  }

  const emojis = [ '😆', '😯', '😢', '😡', '🙈', '💯' ];
  const sendEmoji = emoji => () => setInput(`${input}${emoji}`);

  return (
    <Box
      height="100vh"
      width={400}
      display="flex"
      flexWrap="wrap"
      border="1px solid black">
      <Box
        display="flex"
        width={1}
        height="calc(100% - 56px - 61px)"
        flexDirection="column"
        style={{ overflowY: "scroll" }}>
        {chatMsgs.map((msg, i) => (
          <Box key={i} width={370} m={1}>
            <Typography>
              {`${msg.name}: ${msg.msg}`}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        alignSelf="flex-end"
        display="flex"
        justifyContent="space-evenly">
        {emojis.map(emoji => (
          <Button className={classes.emoji} onClick={sendEmoji(emoji)}>
            {emoji}
          </Button>
        ))}
      </Box>
      <Box alignSelf="flex-end">
        <form onSubmit={send}>
          <Box display="flex">
            <TextField
              variant="outlined"
              label="Chat message"
              style={{ width: 334 }}
              value={input}
              onChange={e => setInput(e.target.value)} />
            <Button
              type="submit"
              variant="contained"
              color="primary">
              Send
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
export default Chat;