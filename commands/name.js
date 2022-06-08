const Discord = require("discord.js");
const cooldowns = new Map();
const humanizeDuration = require("humanize-duration");

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

  let guild = message.guild;
  let chanName = args.slice(0).join(" ");

  if (!chanName) {
    return message.channel.send(
      usageEmbed("Name", "(name)", "my new channel name")
    );
  }

  if (!guild.members.cache.get(message.author.id).voice.channel)
    return message.channel.send(
      textEmbed(
        ":x: | You're not connected to a voice channel, please try again."
      )
    );
  let authorChannel = message.member.voice.channel;

  const cooldown = cooldowns.get(authorChannel.id);

  if (cooldown) {
    const remaining = humanizeDuration(cooldown - Date.now(), { round: true });
    return message.channel
      .send(
        textEmbed(
          `:timer: | You have to wait **${remaining}** before you can rename your channel again`
        )
      )
      .then((msg) => {
        setTimeout(function () {
          try {
            msg.delete();
            message.delete();
          } catch {}
        }, 10000);
      })
      .catch();
  }

  try {
    onetap = await client.db
      .prepare("SELECT * FROM channels WHERE channelID = ?")
      .get(authorChannel.id);
    var guildIDonetap = onetap.guildID;
  } catch (err) {
    return message.channel
      .send(
        textEmbed(
          ":x: | Couldn't fetch the channel please make a new one! (make sure that your current voice channel is a One-Tap ) "
        )
      )
      .then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      })
      .catch();
  }

  if (onetap.ownerID !== message.author.id) {
    return message.channel.send(
      textEmbed(
        ":x: | You're not the channel owner therefore you can't perform this action."
      )
    );
  }

  authorChannel
    .setName(chanName)
    .then((test) => {
      message.channel.send(
        textEmbed(
          `:white_check_mark: | Channel name changed to \`${chanName}\` successfully`
        )
      );
      cooldowns.set(authorChannel.id, Date.now() + 5 * 60 * 1000);
      setTimeout(() => cooldowns.delete(authorChannel.id), 5 * 60 * 1000);
    })
    .catch(async (err) => {
      return message.reply(
        textEmbed(
          `:eye:  | Due to Discord TOS, a channel name can't contain words that discord finds unacceptable `
        )
      );
    });
};
exports.aliases = ["rename"];
