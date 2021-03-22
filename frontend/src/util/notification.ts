import { createContext } from "react";

export const NotificationContext = createContext<React.Dispatch<React.SetStateAction<string>>>(() => {});
