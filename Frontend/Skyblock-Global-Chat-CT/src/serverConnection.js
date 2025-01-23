import WebSocket from "WebSocket";
import {
  ChatPrefix,
  ConsolePrefix,
  RESET,
  YELLOW,
  RED,
  GREEN,
} from "./utils/constants";

const GLOBAL_CHAT_WS_URL = "ws://localhost:11000/";

class ServerConnection {
  constructor(url) {
    this.url = url;
    this.socket = null;

    this.autoReconnect = true;
    this.reconnectDelay = 30000;
    this.reconnectTimer = null;
  }

  connect() {
    //if (!World.isLoaded()) return;
    if (this.socket) {
      this.close(false);
    }

    this.socket = new WebSocket(this.url);

    this.socket.onMessage = this.onMessage.bind(this);
    this.socket.onError = this.onError.bind(this);
    this.socket.onOpen = this.onOpen.bind(this);
    this.socket.onClose = this.onClose.bind(this);

    this.socket.connect();

    this.autoReconnect = true;
  }

  send(data) {
    if (!this.socket) {
      ChatLib.chat(
        `${ChatPrefix} ${RED}Not connected to WebSocket server!${RESET}`
      );
      return;
    }

    try {
      const jsonString = JSON.stringify(data);
      this.socket.send(jsonString);
    } catch (err) {
      console.error(`${ConsolePrefix} Error while sending: ${err}`);
    }
  }

  close(disableAutoReconnect = true) {
    if (disableAutoReconnect) {
      this.autoReconnect = false;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  reconnect() {
    if (!World.isLoaded()) return;
    this.autoReconnect = true;
    this.close(false);
    this.connect();
  }

  onMessage(message) {
    try {
      ChatLib.chat(`${ChatPrefix} ${message}${RESET}`);
    } catch (err) {
      console.error(`${ConsolePrefix} [onMessage]`, err);
    }
  }

  onError(error) {
    console.error(`${ConsolePrefix} [onError]`, error);
  }

  onOpen() {
    ChatLib.chat(`${ChatPrefix} ${GREEN}Connected to server.${RESET}`);
  }

  onClose() {
    ChatLib.chat(`${ChatPrefix} ${RED}Connection closed.${RESET}`);

    if (this.autoReconnect) {
      ChatLib.chat(
        `${ChatPrefix} ${YELLOW}Attempting reconnect in ${
          this.reconnectDelay / 1000
        }s...${RESET}`
      );

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }
}

export const connection = new ServerConnection(GLOBAL_CHAT_WS_URL);

register("gameUnload", () => {
  connection.close();
});
