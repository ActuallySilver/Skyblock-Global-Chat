import { connection } from "./serverConnection";

register("messageSent", (message, event) => {
  if (message.startsWith("/")) return;
  connection.send(JSON.stringify({ User: Player.getDisplayName().text, Text: message }));
  event.setCancelled(true);
});
