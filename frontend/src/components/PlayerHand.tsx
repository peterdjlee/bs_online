import Card from '@heruka_urgyen/react-playing-cards/lib/TcN';
import './cards.css';

function PlayerHand() {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'K', 'Q', 'K', 'A'];
  const suits = ['c', 'd', 'h', 's']
  const cards: Card[] = [];
  for (let i = 0; i < 10; i++) {
    cards.push(<div onClick={() => console.log('CLICK')}><Card key={i} card={ranks[i % 14] + suits[i % 4]} height="150px" /></div>);
  }
  return (
    <div className="player-hand">
      { cards}
    </div>
  );
}

export default PlayerHand;
