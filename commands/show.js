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

  if (!guild.members.cache.get(message.author.id).voice.channel)
    return message.channel.send(
      textEmbed(
        ":x: | You're not connected to a voice channel, please try again."
      )
    );
  let authorChannel = message.member.voice.channel;

  const premiumRoles = [];
  premiumRoles.push("796590171024785439");
  premiumRoles.push("808724777274572852");
  premiumRoles.push("796588390614171669");
  premiumRoles.push("796578476982665226");
  premiumRoles.push("799856315601780749");
  premiumRoles.push("796573435294908476");
  premiumRoles.push("859128851001901108");
  premiumRoles.push("859126964749205514");
  premiumRoles.push("775898112979501106");

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

  authorChannel.permissionOverwrites
    .edit(verified, { VIEW_CHANNEL: true })
    .then((test) => {
      message.channel.send(
        textEmbed(
          `:eyes: | Ghost mode is now deactivated, everyone can see this channel.`
        )
      );
    });
};
exports.aliases = ["unhide"];
