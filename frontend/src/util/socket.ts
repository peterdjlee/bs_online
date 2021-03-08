import { createContext } from "react";

// const SOCKET_URI = `ws://${window.location.host}/socket.io/?EIO=3&transport=websocket`;
const SOCKET_URI = "ws://localhost:5000/socket.io/?EIO=3&transport=websocket";

class MockSocketIO {
  ws: WebSocket;
  listeners: object;

  constructor() {
    this.ws = new WebSocket(SOCKET_URI);
    this.listeners = {};
    this.ws.onmessage = (msg: MessageEvent) => {
      if (msg.data.slice(0,2) !== "42") return;
      const data = JSON.parse(msg.data.slice(2));
      const eventType = data[0];
      const args = data.slice(1);
      if (eventType in this.listeners) {
        this.listeners[eventType](...args);
      } else {
        throw Error(`There are no listeners for eventType: ${eventType}`);
      }
    }
  }

  on(eventType: string, callback: Function) {
    switch (eventType) {
      case "connection":
        this.ws.onopen = function(this, event) {
          return callback(event);
        };
        break;
      default:
        this.listeners[eventType] = callback;
        break;
    }
  }

  emit(eventType: string, ...args: any[]) {
    let msg = "42" + JSON.stringify([eventType, ...args]);
    this.ws.send(msg);
  }
}

export const socket = new MockSocketIO();
export const SocketContext = createContext(socket);
