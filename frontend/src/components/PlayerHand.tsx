import React from 'react';
import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import './cards.css';

function PlayerHand({ cards } : { cards: string[] }) {
  return (
    <div className="player-hand">
      {cards.map((card, i) => (
        <div onClick={() => console.log('CLICK')}>
          <Card key={i} card={card} height="150px" />
        </div>
      ))}
    </div>
  );
}

export default PlayerHand;
