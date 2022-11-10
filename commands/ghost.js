const Discord = require("discord.js");

const { Permissions } = require("discord.js");

exports.run = async (client, message, args) => {
  let guild = message.guild;
  let ided = message.guild.id;
  let verified = message.guild.roles.cache.find(
    (r) => r.name === "✦ Verified・"
  );

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

  if (!guild.members.cache.get(message.author.id).voice.channel)
    return message.channel.send(
      textEmbed(
        ":x: | You're not connected to a voice channel, please try again."
      )
    );
  let authorChannel = message.member.voice.channel;

  const premiumRoles = ["1037823207408934912", "1037823216707706930", "1037823225771593801", "1037823234982289508", "1037823243987464192", "1037823252925517894", "1037823511806357574", "1037823502461448313"]

  
  let roles = [];

  for (const role of premiumRoles) {
    var rl = client.findRole(message.guild, role);
    if (rl) {
      roles.push(client.findRole(message.guild, role));
    }
  }

  flag = false;
  roles.forEach((role) => {
    if (
      message.member.roles.cache.find((r) => r.id === role.id) ||
      message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)
    )
      flag = true;
  });
  if (
    flag === false &&
    !message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)
  )
    return message.channel.send({
      embeds: [
        textEmbed(
          ":x: | Sorry but this feature is only reserved for **Premium Quality** users and **Donators** ( for the moment )"
        ),
      ],
    });

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

  authorChannel.permissionOverwrites
    .edit(verified, { VIEW_CHANNEL: false })
    .then((test) => {
      message.channel.send({
        embeds: [
          textEmbed(
            `:ghost: | Ghost mode is now active, only you and permitted users can see this channel.`
          ),
        ],
      });
    });
};
exports.aliases = ["hide"];
