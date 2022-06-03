const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  function textEmbed(text) {
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(text);
    return { embeds: [embed] };
  }

  function usageEmbed(command, usage, example) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(
        message.author.tag,
        message.author.avatarURL({ dynamic: true })
      )
      .setTitle(`Invalid arguments`)
      .addField(
        "Usage",
        `\`${client.prefix} ${command.toLowerCase()} ${usage}\``
      )
      .addField(
        "Example",
        `\`${client.prefix} ${command.toLowerCase()} ${example}\``
      )
      .setColor("RANDOM");
    return { embeds: [embed] };
  }

  var option = args[0];

  switch (option) {
    case "help":
      message.reply(usageEmbed("owner", "(user)", "set @Yatsu"));
      break;
    case "set":
      if (!args[1])
        return message.channel.send(
          usageEmbed("owner", "(user)", "set @Yatsu")
        );
      var user = client.getUserFromMention(message.channel.guild, args[1]);
      if (!user)
        return message.channel.send(
          textEmbed(":x: | I couldn't find any user, please try again.")
        );
      setOwner(client, message, user);
      break;
    case "move":
      if (!args[1])
        return message.channel.send(
          message.reply(usageEmbed("owner", "(user)", "set @Yatsu"))
        );
      var user = client.getUserFromMention(message.channel.guild, args[1]);
      if (!user)
        return message.channel.send(
          textEmbed(":x: | I couldn't find any user, please try again.")
        );
      setOwner(client, message, user);
      break;
    default:
      if (args[0]) {
        var user = client.getUserFromMention(message.channel.guild, args[0]);
        if (!user)
          return message.channel.send(
            textEmbed(":x: | I couldn't find any user, please try again.")
          );
        setOwner(client, message, user);
      } else {
        if (!message.guild.members.cache.get(message.author.id).voice.channel)
          return message.channel.send(
            textEmbed(":x: | You're not connected to a voice channel!")
          );

        let authorChannel = message.member.voice.channel;

        try {
          onetap = await client.db
            .prepare("SELECT * FROM channels WHERE channelID = ?")
            .get(authorChannel.id);
          var guildIDonetap = onetap.guildID;
        } catch (err) {
          console.log(err);
          return message.channel.send(
            textEmbed(
              ":x: | Couldn't fetch the channel please make a new one! (make sure that your current voice channel is a One-Tap"
            )
          );
        }
        return message.reply(
          textEmbed(
            `:bell: | ${client.getUserFromMention(
              message.channel.guild,
              onetap.ownerID
            )} is the current owner of the channel.`
          )
        );
      }
  }

  async function setOwner(client, message, user) {
    let guild = message.guild;

    if (!guild.members.cache.get(message.author.id).voice.channel)
      return message.channel.send(
        textEmbed(
          ":x: | You're not connected to a voice channel, please try again."
        )
      );
    let authorChannel = message.member.voice.channel;

    try {
      onetap = await client.db
        .prepare("SELECT * FROM channels WHERE channelID = ?")
        .get(authorChannel.id);
      var guildIDonetap = onetap.guildID;
    } catch (err) {
      console.log(err);
      return message.channel.send(
        textEmbed(
          ":x: | Couldn't fetch the channel please make a new one! (make sure that your current voice channel is a One-Tap"
        )
      );
    }

    if (onetap.ownerID !== message.author.id) {
      return message.channel.send(
        textEmbed(
          ":x: | You're not the channel owner therefore you can't perform this action."
        )
      );
    }

    if (user.id == onetap.ownerID) {
      return message.channel.send(
        textEmbed(":x: | You can't move the ownership to yourself.")
      );
    }

    const confirmation = await message.channel.send(
      textEmbed(
        `:question: | Are you sure you want to move the channel ownership to ${user}, this action is irreversible! (reply with yes or no within 30 seconds)`
      )
    );

    const filter = (m) => m.author.id == message.author.id;

    const ownerCollection = message.channel.createMessageCollector({
      filter,
      time: 30000,
      max: 1,
      errors: ["time"],
    });

    const approve = ["yes", "y", "we", "oui", "yessir"];
    const decline = ["no", "n", "nn", "nah", "nope"];

    ownerCollection.on("collect", async (m) => {
      if (decline.includes(m.content.toLowerCase())) {
        return func.textMsg(
          message,
          ":x: | **Action cancelled** You've replied with no"
        );
      }

      if (approve.includes(m.content.toLowerCase())) {
        try {
          const updateOwner = client.db.prepare(
            `UPDATE channels SET ownerID = ? WHERE channelID = ?`
          );
          updateOwner.run(user.id, onetap.channelID);
          ownerCollection.stop();
          return m.reply(
            textEmbed(
              `:white_check_mark: | The channel ownership has been successfully moved to ${user}`
            )
          );
        } catch (error) {
          console.log(error);
          ownerCollection.stop();
        }
      }
    });

    ownerCollection.on("end", (collected, err) => {
      if (err == "time") {
        return m.reply(
          textEmbed(
            "⏲️ | **Action Cancelled** 30 seconds have passed and i got no response"
          )
        );
      }
    });
  }
};
