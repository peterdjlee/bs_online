import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@material-ui/core";

function Chat({ chatMsgs, sendChat }) {
  const [input, setInput] = useState('');
  const send = e => {
    e.preventDefault();
    sendChat(input);
    setInput('');
  }

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
        height="calc(100% - 56px)"
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
