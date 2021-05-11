import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { Box, Button, Typography } from '@material-ui/core';
import { RouterProps, withRouter } from 'react-router-dom';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import PlayerHand from '../components/PlayerHand';
import Table, { WIDTH as TABLE_WIDTH, HEIGHT as TABLE_HEIGHT } from '../components/Table';
import { PlayerContext } from '../util/player';
import { SocketContext } from '../util/socket';
import { compareCards, getCardID, getCardString, rankString } from '../util/cards';
import { NotificationContext } from '../util/notification';
import GameOver from '../components/GameOver';
import Chat from '../components/Chat';
import useSound from 'use-sound';
import bsSound from '../assets/bs.mp3';

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
  const setNotification = useContext(NotificationContext);
  const [hand, setHand] = useState<string[]>([]);
  const [table, setTable] = useState<any[]>([]);
  const [turn, setTurn] = useState({ exp_name: "", exp_rank: 0, pos: 0, turn: 0 });
  const [pileCount, setPileCount] = useState(0);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>();
  const [playedCards, setPlayedCards] = useState({ pos: 0, count: 0 });
  const [bsDest, setBsDest] = useState(-1);
  const [opNum, setOpNum] = useState(0);
  const [play] = useSound(bsSound, { volume : 0.25});

  const toggleCard = card => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(card2 => card !== card2));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const playTurn = () => {
    if (selectedCards.length === 0) return;
    socket.emit('PlayCard', {
      op_num: opNum,
      lobby_code: player.room,
      cards: selectedCards.map(getCardID)
    });
    setSelectedCards([]);
  }

  const callBS = () => {
    socket.emit('CallBS', {
      op_num: opNum,
      lobby_code: player.room
    });
    setSelectedCards([]);
  }

  useEffect(() => {
    socket.on('UpdatePlayerHand', cards => {
      setHand(cards.map(getCardString).sort(compareCards));
    });
    socket.on('UpdateOtherHands', hands => setTable(hands));
    socket.on('UpdateTurnInfo', turn => setTurn(turn));
    socket.on('UpdateCenterPile', e => setPileCount(pileCount + e.change));
    socket.on('PlayCardsError', e => setNotification(e.msg));
    socket.on('BSResult', result => {
      play();
      if (result.was_bs) {
        setBsDest(result.callee_pos);
      } else {
        setBsDest(result.caller_pos);
      }
      setTimeout(() => setBsDest(-1), 1000);
      setNotification(`
        ${result.caller_name}
        ${result.was_bs ? 'correctly' : 'incorrectly'}
        called BS on ${result.callee_name}`);
    });
    socket.on('GameOver', result => {
      setWinner(result[0].nickname);
      socket.emit('CloseBSSockets');
    });
    socket.on('PlayCardEvent', e => setPlayedCards(e));
    socket.on('UpdateOpNum', n => setOpNum(n));
    socket.on('StopGame', () => {
      // pass true in the state meaning reset lobby
      props.history.push('/lobby', true);
    })
    socket.emit('RequestGameInfo', { lobby_code: player.room });
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
        alignItems="center"
        justifyContent="center">
        <Table
          hands={table}
          turn={turn.pos}
          played={playedCards}
          bsPos={bsDest} />
        <Box
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          top={0}>
          <Typography variant="h4">{rankString[turn.exp_rank]}</Typography>
          <Box textAlign="center" p={4}>
            {pileCount != 0 ? <Card height={100} back /> : <Box></Box>}
            <Typography>{pileCount} cards</Typography>
          </Box>
          <Button
            onClick={callBS}
            variant="contained"
            color="primary">
            Call BS
          </Button>
        </Box>
        <Typography variant="h4">{player.nickname}'s hand:</Typography>
        <Box width={TABLE_WIDTH}>
          <PlayerHand
            cards={hand}
            selectedCards={selectedCards}
            cardClicked={toggleCard}
          />
        </Box>
        <Button
          onClick={playTurn}
          variant="contained"
          className={classes.button}
          color="primary">
          Submit
        </Button>
        <GameOver winner={winner} />
      </Box>
      <Chat />
    </Box>
  )
}
export default withRouter(Game);
