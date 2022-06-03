const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  if (!message.channel.permissionsFor(message.author).has("ADMINISTRATOR"))
    return;

  function textEmbed(text) {
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(text);
    return { embeds: [embed] };
  }

  function makeCategory() {
    try {
      message.guild.channels.create("Voice Channels", {
        type: "category",
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: ["VIEW_CHANNEL"],
            allow: ["CONNECT"],
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }
  }

  function makeMainChannel() {
    try {
      let categ = message.guild.channels.cache.find(
        (x) => x.name === "Voice Channels"
      );
      message.guild.channels.create("One Tap", {
        type: "voice",
        parent: categ,
        userLimit: 1,
        permissionOverwrites: [
          {
            id: message.guild.id,
            allow: ["VIEW_CHANNEL"],
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }
  }

  let categ = message.guild.channels.cache.find(
    (x) => x.name === "Voice Channels"
  );

  if (categ) {
    message.channel.send(
      textEmbed(":x: | **One-Tap** Category already exsit!")
    );
    return;
  } else {
    makeCategory();
    await sleep(2000);
    makeMainChannel();
  }
};
