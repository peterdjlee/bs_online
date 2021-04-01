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

export function getCardString(card: number) {
  return rank[(card % 52) % 13] + suit[Math.floor((card % 52) / 13)];
}

export function getCardArray(card: string) {
  return [rank.indexOf(card.substr(0, 1)) + 1, suit.indexOf(card.substr(1))];
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
