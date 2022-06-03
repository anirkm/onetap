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

  if (!args[0])
    return message.channel.send(usageEmbed("permit", "(user)", "@Yatsu"));

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
    message.channel.send(
      textEmbed(
        ":x: | Couldn't fetch the channel please make a new one! (make sure that your current voice channel is a One-Tap )"
      )
    );
    return;
  }

  if (onetap.ownerID !== message.author.id) {
    return message.channel.send(
      textEmbed(
        ":x: | You're not the channel owner therefore you can't perform this action."
      )
    );
  }

  let ab =
    message.mentions.members.first() ||
    message.mentions.roles.first() ||
    message.guild.members.cache.get(args[0]) ||
    client.findRole(message.channel.guild, args[0]);

  if (!ab)
    return message.channel.send(
      textEmbed(":x: | I couldn't find any user or role, please try again")
    );

  let verifiedRole = await message.guild.roles.cache.find(
    (r) => r.id === "809087546088357908"
    //(r) => r.name === "Verified"
  );

  if (args.length > 1) {
    var permited = [];
    var failed = 0;
    var msg = await message.channel.send(
      textEmbed(":hourglass_flowing_sand: | Please wait...")
    );
    for (arg of args) {
      var target =
        client.getUserFromMention(message.channel.guild, arg) ||
        client.findRole(message.channel.guild, arg);
      if (target instanceof Discord.Role) {
        if (target == verifiedRole) {
          return message.channel.send(
            textEmbed(
              `:x: | You cannot perform this action on the ${verifiedRole} role!`
            )
          );
        }
        if (target == message.guild.roles.everyone) {
          return message.channel.send(
            textEmbed(`:x: | You cannot perform this action on everyone :')`)
          );
        }
      }
      if (target) {
        try {
          await authorChannel.permissionOverwrites.edit(target, {
            CONNECT: true,
            VIEW_CHANNEL: true,
            SPEAK: true,
          });
        } catch (err) {
          console.log(err);
        }
        await permited.push(target.id);
      } else {
        failed++;
      }
    }
    var desc = "";
    permited.forEach((user) => (desc += `${guild.members.cache.get(user)} `));

    const embed = new Discord.MessageEmbed().setDescription(
      `:white_check_mark: | You have permitted ${desc} to have access to your channel.`
    );

    return msg.edit(embed);
  } else {
    if (ab instanceof Discord.Role) {
      if (ab == verifiedRole) {
        return message.channel.send(
          textEmbed(
            ":x: | You can only supply a Guild Member or a Discord Role."
          )
        );
      }
    }
    authorChannel
      .permissionOverwrites.edit(ab, { CONNECT: true, VIEW_CHANNEL: true, SPEAK: true })
      .then((test) => {
        message.reply(
          textEmbed(
            `:white_check_mark: | You have permitted to ${ab} to have access to your channel.`
          )
        );
      });
  }
};
exports.aliases = ["allow"];
