import { connection } from "./serverConnection";
import settings from "./settings";

register("command", () => {
  settings.openGUI();
}).setName("globalchat");

register("messageSent", (message, event) => {
  if (message.startsWith("/")) return;
  connection.send(JSON.stringify({ User: Player.getDisplayName().text, Text: message }));
  event.setCancelled(true);
});