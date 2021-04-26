import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import OtherHand, { getPosition, CARD_HEIGHT, CARD_WIDTH } from './OtherHand';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';

export const WIDTH = 1000;
export const HEIGHT = 600;

const centerPos = {
  left: WIDTH / 2 - CARD_WIDTH / 2,
  top: HEIGHT / 2 - 1.5 * CARD_HEIGHT
};

const useStyles = makeStyles({
  playedCard: {
    position: 'absolute',
    animation: '$slide 1s',
    animationDelay: 'calc(var(--order)*300ms)'
  },
  '@keyframes slide': {
    '100%': centerPos
  },
  bsCard: {
    position: 'absolute',
    animation: '$slide 1s',
    animationDirection: 'reverse',
  },
});

function Table({ hands, turn, played, bsPos }: {
  hands: object[],
  turn: number,
  played: {
    pos: number,
    count: number
  },
  bsPos: number,
}) {
  const classes = useStyles();

  let playedCards: JSX.Element[] = [];
  const startPos = getPosition(played.pos, hands.length);
  for (let i = 0; i < played.count; i++) {
    playedCards.push(
      <Box
        key={i + hands.length * played.pos}
        className={classes.playedCard}
        // @ts-ignore
        style={{ "--order": i }}
        {...startPos}>
        <Card height={CARD_HEIGHT} back />
      </Box>
    );
  }

  // Use a list instead of an element so the element is not recreated on rerender.
  // This ensures that the animation continues smoothly even if a rerender occurs.
  let bsCard: JSX.Element[] = [];
  const playerPos = getPosition(bsPos, hands.length);
  if (bsPos !== -1) {
    bsCard.push(
      <Box
        key={0}
        className={classes.bsCard}
        {...playerPos}>
        <Card height={CARD_HEIGHT} back />
      </Box>
    );
  }

  return (
    <Box
      border={1}
      marginTop="50px"
      borderRadius="50%"
      borderColor="grey.400"
      position="relative"
      width={WIDTH}
      height={HEIGHT}>
      {played !== undefined && playedCards}
      {bsPos !== undefined && bsCard}
      {hands.map((hand, i) => (
        <OtherHand hand={hand} total={hands.length} turn={turn} key={i} />
      ))}
    </Box>
  );
}

export default Table;
