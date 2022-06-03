const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  function textEmbed(text) {
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(text);
    return embed;
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
    return embed;
  }

  let guild = message.guild;
  let ab = args[0];

  if (!guild.members.cache.get(message.author.id).voice.channel)
    return message.channel.send({
      embeds: [
        textEmbed(
          ":x: | You're not connected to a voice channel, please try again."
        ),
      ],
    });

  let authorChannel = message.member.voice.channel;

  try {
    onetap = await client.db
      .prepare("SELECT * FROM channels WHERE channelID = ?")
      .get(authorChannel.id);
    var guildIDonetap = onetap.guildID;
  } catch (err) {
    return message.channel
      .send({
        embeds: [
          textEmbed(
            ":x: | Couldn't fetch the channel please make a new one! (make sure that your current voice channel is a One-Tap ) "
          ),
        ],
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      })
      .catch();
  }

  if (onetap.ownerID !== message.author.id) {
    return message.channel.send({
      embeds: [
        textEmbed(
          ":x: | You're not the channel owner therefore you can't perform this action."
        ),
      ],
    });
  }

  if (!ab)
    return message.channel.send({
      embeds: [usageEmbed("Limit", "(voice limit)", "10")],
    });
  if (isNaN(ab))
    return message.channel.send({
      embeds: [usageEmbed("Limit", "(voice limit)", "10")],
    });
  if (ab < 0 || ab > 99)
    return message.reply(
      message.channel.send({
        embeds: [
          textEmbed(
            ":x: | Channel user limit value must be between `0` and `99`, please try again."
          ),
        ],
      })
    );

  authorChannel.edit({ userLimit: ab }).then((test) => {
    if (ab == 0) {
      message.channel.send({
        embeds: [
          textEmbed(
            `:white_check_mark: | Channel user limit updated to \`unlimited\` users successfully.`
          ),
        ],
      });
    } else {
      message.channel.send({
        embeds: [
          textEmbed(
            `:white_check_mark: | Channel user limit updated to \`${ab}\` users successfully.`
          ),
        ],
      });
    }
  });
};
exports.aliases = ["setlimit"];
