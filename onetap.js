const { Client, Collection } = require("discord.js");
const { token, prefix, dev } = require("./config");
const db = require("./utils/DBInit.js");
const fs = require("fs");
const queue = require("./utils/queue");

const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_BANS",
    "GUILD_EMOJIS_AND_STICKERS",
    "GUILD_INTEGRATIONS",
    "GUILD_INVITES",
    "GUILD_VOICE_STATES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGES",
  ],
});

client.prefix = prefix;
client.db = db;
client.findRole = function (guild, role) {
  var r = guild.roles.cache.find(
    (x) => x.name.toLowerCase() === role.toLowerCase()
  );
  theRole = r;
  if (!r) {
    var r = guild.roles.cache.find((x) => x.id === role);
    theRole = r;
  }
  return theRole;
};

client.getUserFromMention = function (guild, mention) {
  if (!mention) return;
  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return guild.members.cache.get(mention);
  } else {
    return guild.members.cache.get(mention);
  }
};

client.getRoleFromMention = function (guild, mention) {
  if (!mention) return;
  if (mention.startsWith("<@&") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return guild.members.cache.get(mention);
  } else {
    return guild.members.cache.get(mention);
  }
};

fs.readdir("./events/", (err, files) => {
  if (err) return console.error;
  files.forEach((file) => {
    if (!file.endsWith(".js")) return undefined;
    const event = require(`./events/${file}`);
    const eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Collection();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error;
  files.forEach((file) => {
    if (!file.endsWith(".js")) return undefined;
    const props = require(`./commands/${file}`);
    const cmdName = file.split(".")[0];
    console.log(cmdName);
    client.commands.set(cmdName, props);
  });
});

client.on("error", console.error);
client.on("warn", console.warn);

client.login(token);

queue.startTasks();
