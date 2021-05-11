import { createContext } from "react";

export const defaultChat: { name: string, msg: string }[] = [];
export const ChatContext = createContext(defaultChat);

