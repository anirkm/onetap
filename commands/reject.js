const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const mainCate = message.guild.channels.cache.find(
    (x) => x.name === "Voice Channels"
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

  let ab =
    message.mentions.members.first() ||
    message.mentions.roles.first() ||
    message.guild.members.cache.get(args[0]) ||
    client.findRole(message.channel.guild, args[0]);

  if (!ab)
    return message.channel.send(
      textEmbed(":x: | I couldn't find any user or role, please try again")
    );

  if (args.length > 1) {
    var rejected = [];
    var failed = 0;
    var msg = await message.channel.send(
      textEmbed(":hourglass_flowing_sand: | Please wait...")
    );
    for (arg of args) {
      var target = client.getUserFromMention(message.channel.guild, arg);
      if (target) {
        if (onetap.ownerID === target.id) continue;
        try {
          await authorChannel.updateOverwrite(target, {
            CONNECT: false,
            VIEW_CHANNEL: null,
            SPEAK: null,
          });
          if (
            target.voice.channel &&
            target.voice.channel.id === onetap.channelID
          ) {
            try {
              message.guild.channels.cache.map(async (channel) => {
                if (channel.parent === mainCate) {
                  if (channel.type !== "voice") return;
                  if (channel.parent !== mainCate) return;
                  if (channel.name === "One Tap" && channel.position == 0) {
                    try {
                      await target.voice.setChannel(channel);
                    } catch {}
                  }
                }
              });
            } catch {}
          }
        } catch (err) {
          console.log(err);
        }
        await rejected.push(target.id);
      } else {
        failed++;
      }
    }
    var desc = "";
    rejected.forEach((user) => (desc += `${guild.members.cache.get(user)} `));

    const embed = new Discord.MessageEmbed().setDescription(
      `:white_check_mark: | You've rejected ${desc} to have access to your channel.`
    );

    return msg.edit(embed);
  } else {
    if (onetap.ownerID === ab.id) {
      return message.channel.send(
        textEmbed(
          ":name_badge: | Action cancelled, you can't reject the channel owner (yourself lmao)"
        )
      );
    }
    let verifiedRole = await message.guild.roles.cache.find(
      (r) => r.id === "809087546088357908"
      //(r) => r.name === "Verified"
    );
    if (ab == verifiedRole) {
      return message.channel.send(
        textEmbed(
          `:x: | You cannot perform this action on the ${verifiedRole} role!`
        )
      );
    }
    authorChannel
      .updateOverwrite(ab, { CONNECT: false, VIEW_CHANNEL: null, SPEAK: null })
      .then((test) => {
        message.reply(
          textEmbed(
            `:white_check_mark: | You have rejected ${ab} to have access to your channel.`
          )
        );
      });
    if (ab instanceof Discord.GuildMember) {
      if (ab.voice.channel && ab.voice.channel.id === onetap.channelID) {
        try {
          message.guild.channels.cache.map(async (channel) => {
            if (channel.parent === mainCate) {
              if (channel.type !== "voice") return;
              if (channel.parent !== mainCate) return;
              if (channel.name === "One Tap" && channel.position == 0) {
                try {
                  await ab.voice.setChannel(channel);
                } catch {}
              }
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    } else if (ab instanceof Discord.Role) {
      authorChannel.members.forEach((member) => {
        if (onetap.ownerID === member.id) return;
        if (member.roles.cache.some((role) => role === ab)) {
          try {
            message.guild.channels.cache.map(async (channel) => {
              if (channel.parent === mainCate) {
                if (channel.type !== "voice") return;
                if (channel.parent !== mainCate) return;
                if (channel.name === "One Tap" && channel.position == 0) {
                  try {
                    await member.voice.setChannel(channel);
                  } catch {}
                }
              }
            });
          } catch (err) {
            console.log(err);
          }
        }
      });
    } else {
      return message.channel.send(
        textEmbed(":x: | You can only supply a Guild Member or a Discord Role.")
      );
    }
  }
};
