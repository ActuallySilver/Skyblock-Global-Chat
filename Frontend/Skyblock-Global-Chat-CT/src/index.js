import { connection } from "./serverConnection";
import { ChatPrefix, RED, YELLOW, GOLD, RESET, GREEN } from "./utils/constants";
import settings from "./settings";

let globalChatEnabled = false;

register("command", (...args) => {
  if (args.length < 1) {
    ChatLib.chat(`${ChatPrefix} ${RED}Usage: /globalchat <message>${RESET}`);
    return;
  }
  const message = args.join(" ");

  const messageData = {
    User: Player.getName(),
    Text: message,
  };
  connection.send(JSON.stringify(messageData));
}).setName("globalchat");

register("command", (...args) => {
  if (!args) return;
  if (!args[0]) {
    settings.openGUI();
    return;
  }

  const subCommand = (args[0] || "").toLowerCase();
  switch (subCommand) {
    case "settings":
      settings.openGUI();
      break;
    case "connect":
      connection.connect();
      break;
    case "disconnect":
      connection.close();
      ChatLib.chat(
        `${ChatPrefix} ${RED}Disconnected. Auto-reconnect disabled.${RESET}`
      );
      break;
    case "toggle":
      globalChatEnabled = !globalChatEnabled;

      const globalChatEnabledStatus = globalChatEnabled
        ? `${GREEN}Enabled${RESET}`
        : `${RED}Disabled${RESET}`;
      ChatLib.chat(
        `${ChatPrefix} ${GOLD}Auto-send to global is now:${RESET} ${globalChatEnabledStatus}`
      );
      break;
    case "help":
      ChatLib.chat(`${ChatPrefix}`);
      ChatLib.chat(`${YELLOW}/global connect - Connect to server${RESET}`);
      ChatLib.chat(
        `${YELLOW}/global disconnect - Disconnect from server${RESET}`
      );
      ChatLib.chat(
        `${YELLOW}/global toggle - Toggle auto-send to global${RESET}`
      );
      ChatLib.chat(
        `${YELLOW}/globalchat [msg] - Send message to global chat${RESET}`
      );
      break;
    default:
      ChatLib.chat(
        `${ChatPrefix} ${RED}Unknown subcommand. Try /global help${RESET}`
      );
  }
}).setName("global");

register("messageSent", (message, event) => {
  if (message.startsWith("/")) return;

  if (globalChatEnabled) {
    const messageData = {
      User: Player.getName(),
      Text: message,
    };
    connection.send(JSON.stringify(messageData));

    event.setCancelled(true);
  }
});

register("gameLoad", () => {
  if (!settings.enableAutoconnect) return;
  connection.connect();
});
