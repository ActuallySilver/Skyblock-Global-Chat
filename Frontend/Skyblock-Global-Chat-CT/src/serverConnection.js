import WebSocket from "WebSocket";

export const connection = new WebSocket("http://localhost:11000/");

connection.onMessage = (msg) => {
  ChatLib.chat(`${msg}`);
};

connection.onError = (exception) => {};

connection.onOpen = () => {};

connection.onClose = () => {};

connection.connect();

// Object.keys(connection.socket).forEach((key) => {
//   ChatLib.chat(key);
// });
register("gameUnload", (player, message, event) => {
  connection.close();
});
