import React from 'react';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import { Box, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  hand: {
    height: 185,
    display: 'flex',
    overflowX: 'scroll',
    alignItems: 'center',
  },
  card: {
    marginRight: 5
  }
});

function PlayerHand({ cards, selectedCards, cardClicked }) {
  const classes = useStyles();
  return (
    <Box className={classes.hand}>
      {cards.map((card, i) => (
        <div className={classes.card} key={i} onClick={() => cardClicked(card)}>
          <Card
            card={card}
            height={selectedCards.includes(card) ? 160 : 140}
          />
        </div>
      ))}
    </Box>
  );
}

export default PlayerHand;
