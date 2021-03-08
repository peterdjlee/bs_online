import { createContext } from "react";

export const defaultPlayer = {
  nickname: '',
  room: '',
};
export const PlayerContext = createContext(defaultPlayer);
