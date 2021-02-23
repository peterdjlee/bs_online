import Card from '@heruka_urgyen/react-playing-cards/lib/FcN';
import './cards.css';

function App() {
  const cards: Card[] = [];
  for (let i = 0; i < 20; i++) {
    cards.push(<Card key={i} card="As" height="200px" back={i % 2 == 0} />);
  }
  return (
    <div className="player-hand">
      { cards }
    </div>
  );
}

export default App;
