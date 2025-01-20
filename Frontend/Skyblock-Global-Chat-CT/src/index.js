import { connection } from "./serverConnection";
import { ChatPrefix, RED, YELLOW, GOLD, RESET } from "./utils/constants";
import settings from "./settings";

let globalChatEnabled = false;

register("command", (...args) => {
  if (args.length < 1) {
    ChatLib.chat(`${ChatPrefix} ${RED}Usage: /globalchat <message>${RESET}`);
    return;
  }
  const message = args.join(" ");

  const payload = {
    User: Player.getName(),
    Text: message
  };
  connection.send(JSON.stringify(payload));
}).setName("globalchat");

register("command", (...args) => {
  if (!args) return;

  const sub = (args[0] || "").toLowerCase();
  switch (sub) {
    case "settings":
      settings.openGUI();
      break;
    case "connect":
      connection.connect();
      break;
    case "disconnect":
      connection.close();
      ChatLib.chat(`${ChatPrefix} ${RED}Disconnected. Auto-reconnect disabled.${RESET}`);
      break;
    case "help":
      ChatLib.chat(`${ChatPrefix}`);
      ChatLib.chat(`${YELLOW}/global connect§r - Connect to server${RESET}`);
      ChatLib.chat(`${YELLOW}/global disconnect§r - Disconnect from server${RESET}`);
      ChatLib.chat(`${YELLOW}/globalchat [msg]§r - Send message to global chat${RESET}`);
      ChatLib.chat(`${YELLOW}/chat global§r - Toggle auto-send to global${RESET}`);
      break;
    default:
      ChatLib.chat(`${ChatPrefix} ${RED}Unknown subcommand. Try /global help${RESET}`);
  }
}).setName("global");

register("command", (...args) => {
  if (args.length > 0) {
    if (args[0].toLowerCase() !== "global") {
      ChatLib.chat(`${ChatPrefix} ${RED}Usage: /chat global${RESET}`);
      return;
    }
  }
  globalChatEnabled = !globalChatEnabled;

  ChatLib.chat(
    `${ChatPrefix} ${GOLD}Auto-send to global is now:${RESET} ${
      globalChatEnabled ? "§aEnabled§r" : "§cDisabled§r"
    }`
  );
}).setName("chat");

register("messageSent", (message, event) => {
  if (message.startsWith("/")) return;

  if (globalChatEnabled) {
    const payload = {
      User: Player.getName(),
      Text: message
    };
    connection.send(JSON.stringify(payload));

    event.setCancelled(true);
  }
});

register("gameLoad", () => {
  if (!World.isLoaded()) return;
  if (!settings.enableAutoconnect) return;
  connection.connect();
});
