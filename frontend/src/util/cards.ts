export const rank = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
];

export const suit = [
  'd',
  'c',
  'h',
  's',
];

export function compareCards(left: string, right: string) {
  const rankL = rank.indexOf(left.substr(0,1));
  const rankR = rank.indexOf(right.substr(0,1));
  const suitL = suit.indexOf(left.substr(1));
  const suitR = suit.indexOf(right.substr(1));
  return (rankL*13+suitL) - (rankR*13+suitR);
}

export function getCardString(card: number) {
  return rank[(card % 52) % 13] + suit[Math.floor((card % 52) / 13)];
}

export function getCardID(card: string) {
  return rank.indexOf(card.substr(0, 1)) + suit.indexOf(card.substr(1))*13;
}

export const rankString = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King',
];
