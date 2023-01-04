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
        message.author.avatarURL({
          dynamic: true,
        })
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

  const option = args[0];
  const ab =
    message.mentions.members.first() ||
    message.guild.members.cache.get(args[1]);

  switch (option) {
    case "help":
      sendHelp(message);
      break;
    case "add":
      if (!ab) {
        return message.channel.send(
          textEmbed(
            ":x: | Unknown or invalid __User__ , Please try again or check your information."
          )
        );
      }
      addBL(client, message, ab);
      break;
    case "remove":
      if (!ab) {
        return message.channel.send(
          textEmbed(
            ":x: | Unknown or invalid __User__ , Please try again or check your information."
          )
        );
      }
      removeBL(client, message, ab);
      break;
    case "list":
      listBL(client, message);
      break;
    case "clear":
      clearBL(client, message);
      break;
    default:
      if (args[0]) {
        var user = client.getUserFromMention(message.channel.guild, args[0]);
        if (!user)
          return message.channel.send(
            textEmbed(":x: | I couldn't find any user, please try again.")
          );
        addBL(client, message, user);
      } else {
        message.channel.send(
          textEmbed(
            ":x: | Unknown or invalid option, Please use __.v blacklist help__  for more help."
          )
        );
      }
  }

  function addBL(client, message, user) {
    const userbl = client.db
      .prepare(`SELECT * FROM bl WHERE userID = ? AND BlID = ?`)
      .get(message.author.id, user.id);
    const userCF = client.db
      .prepare(`SELECT * FROM cf WHERE userID = ? AND frID = ?`)
      .get(message.author.id, user.id);
    if (!userbl && !userCF) {
      client.db
        .prepare("INSERT INTO bl VALUES (?, ?, ?, ?)")
        .run(message.guild.id, message.author.id, user.id, Date.now());
      return message.channel.send(
        textEmbed(
          `:skull: | ${user} has been successfully blacklisted from joining your future channels`
        )
      );
    } else if (!userbl && userCF) {
      return message.channel.send(
        textEmbed(
          `:x: | ${user} is on your close friends list. therefore you can't blacklist until you unfriend the user.`
        )
      );
    } else {
      return message.channel.send(
        textEmbed(`:x: | Sorry but ${user} is already blacklisted.`)
      );
    }
  }

  function removeBL(client, message, user) {
    const userbl = client.db
      .prepare(`SELECT * FROM bl WHERE userID = ? AND BlID = ?`)
      .get(message.author.id, user.id);
    if (userbl) {
      const rmBl = client.db.prepare(
        `DELETE FROM bl WHERE userID = ? AND BlID = ?`
      );
      rmBl.run(message.author.id, user.id);
      return message.channel.send(
        textEmbed(
          `:heart: | ${user} has been successfully removed from your blacklist`
        )
      );
    } else {
      return message.channel.send(
        textEmbed(`:x: | Sorry but ${user} is not blacklisted`)
      );
    }
  }

  async function listBL(client, message) {
    var BlCount = client.db
      .prepare(
        `SELECT COUNT(*) count FROM bl WHERE userID = ${message.author.id}`
      )
      .get().count;

    if (BlCount == 0) {
      return message.channel.send(
        textEmbed(
          `:x: | You don't have anyone on your blacklist, to blacklist someone use __.v blacklist add (user)__ `
        )
      );
    }

    var pages = [];

    var BlData = client.db
      .prepare(`SELECT * FROM bl WHERE userID = ${message.author.id}`)
      .all();

    const BlList = new Discord.MessageEmbed()
      .setAuthor(
        message.author.username + "'s Blacklist",
        message.author.avatarURL({
          dynamic: true,
          size: 4096,
        })
      )
      .setDescription(
        `You have a total of __${BlCount}__ Blacklisted users :no_bell: `
      );

    var n = 0;
    for (var Bliend of BlData) {
      n = n + 1;
      var count = n.toString();
      var BlUser = await message.guild.members.cache.get(Bliend.BlID);
      var date = new Date(Bliend.timestamp);
      pages.push([
        `\n\u200B`,
        `↱ **User**: ${BlUser}\n↳ **Added**: ${date.getDate()}/${
          date.getMonth() + 1
        }/${date.getFullYear()}`,
      ]);
    }

    let maxpages = pages.length / 6;

    if (maxpages % 1 != 0) maxpages = Math.floor(maxpages) + 1;
    let page = 1;
    x = 0;
    try {
      BlList.addField(pages[x][0], pages[x][1], true);
    } catch {}
    try {
      BlList.addField(pages[x + 1][0], pages[x + 1][1], true);
    } catch {}
    try {
      BlList.addField(pages[x + 2][0], pages[x + 2][1], true);
    } catch {}
    try {
      BlList.addField(pages[x + 3][0], pages[x + 3][1], true);
    } catch {}
    try {
      BlList.addField(pages[x + 4][0], pages[x + 4][1], true);
    } catch {}
    try {
      BlList.addField(pages[x + 5][0], pages[x + 5][1], true);
    } catch {}
    BlList.setFooter(`11PM Blacklist - Page: ${page}/${maxpages}`);

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId("left_frlist")
        .setLabel("👈")
        .setStyle("PRIMARY"),
      new Discord.MessageButton()
        .setCustomId("right_frlist")
        .setLabel("👉")
        .setStyle("PRIMARY")
    );

    await message.channel
      .send({ embeds: [BlList], components: [row] })
      .then((msg) => {
        client.on("clickButton", async (button) => {
          if (button.member.user.id != message.author.id) {
            await button.reply({
              content:
                "Sorry but only the message author can navigate between pages",
              ephemeral: true,
            });
          }
          switch (button.customId) {
            case "left_Bllist":
              if (page === 1) return await button.update({});
              page--;
              x = x - 5;
              BlList.fields = [];
              try {
                BlList.addField(pages[x][0], pages[x][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 1][0], pages[x + 1][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 2][0], pages[x + 2][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 3][0], pages[x + 3][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 4][0], pages[x + 4][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 5][0], pages[x + 5][1], true);
              } catch {}
              BlList.setFooter(`11PM Blacklist - Page: ${page}/${maxpages}`);
              msg.edit({ embeds: [BlList] });
              await button.update({});
              break;
            case "right_Bllist":
              if (page === maxpages) return await button.update({});
              page++;
              x = x + 5;
              BlList.fields = [];
              try {
                BlList.addField(pages[x][0], pages[x][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 1][0], pages[x + 1][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 2][0], pages[x + 2][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 3][0], pages[x + 3][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 4][0], pages[x + 4][1], true);
              } catch {}
              try {
                BlList.addField(pages[x + 5][0], pages[x + 5][1], true);
              } catch {}
              BlList.setFooter(`11PM Blacklist - Page: ${page}/${maxpages}`);
              msg.edit({ embeds: [BlList] });
              await button.update({});
              break;
            default:
              return;
          }
        });
      });
  }

  async function clearBL(client, message) {
    var BlCount = client.db
      .prepare(
        `SELECT COUNT(*) count FROM bl WHERE userID = ${message.author.id}`
      )
      .get().count;

    if (BlCount == 0) {
      return message.channel.send(
        textEmbed(
          `:x: | You don't have anyone on your blacklist, to blacklist someone use __.v blacklist add (user)__ `
        )
      );
    }

    const confirmation = await message.channel.send(
      textEmbed(
        `:question: | Are you sure you want to remove ${BlCount} user from your blacklist, this action is irreversible! (reply with yes or no within 30 seconds)`
      )
    );

    const filter = (m) => m.author.id == message.author.id;

    const approve = ["yes", "y", "we", "oui", "yessir"];
    const decline = ["no", "n", "nn", "nah", "nope"];

    const blClear = message.channel.createMessageCollector({
      filter,
      time: 30000,
      max: 1,
      errors: ["time"],
    });

    blClear.on("collect", async (m) => {
      if (decline.includes(m.content.toLowerCase())) {
        return m.reply(
          textEmbed(":x: | **Action cancelled** You've replied with no")
        );
      }

      if (approve.includes(m.content.toLowerCase())) {
        try {
          const rmBl = client.db.prepare(`DELETE FROM bl WHERE userID = ?`);
          var msg = await m.reply(textEmbed(`:timer: | Please wait ...`));
          await rmBl.run(message.author.id);
          blClear.stop();
          return msg.edit(
            textEmbed(
              `:white_check_mark: | A total of __${BlCount}__ users were successfully removed from your blacklist`
            )
          );
        } catch (error) {
          console.log(error);
          blClear.stop();
        }
      }
    });

    blClear.on("end", (collected, reason) => {
      if (reason === "time") {
        return confirmation.edit(
          textEmbed(
            `:hourglass_flowing_sand: | it's been 30 seconds without any confirmation. The action has been cancelled`
          )
        );
      }
    });
  }

  async function sendHelp(message) {
    const helpEmbed = new Discord.MessageEmbed()
      .setAuthor(
        message.author.username,
        message.author.avatarURL({ dynamic: true, size: 4096 })
      )
      .setTitle("➤ How to use .v blacklist command")
      .setDescription(
        "Blacklist command allows to automatically reject blacklisted\nusers for joining your future channels.\n\n➤ **How to use** :\n\n**↱** **Command**: ``.v blacklist add @User``\n**↳**   **Usage:** Allows you to add an user to your blacklist.\n\n**↱** **Command**: ``.v blacklist remove @User``\n**↳**   **Usage:** Allows you to remove an user from your blacklist.\n\n**↱** **Command**: ``.v blacklist list``\n**↳**   **Usage:** Allows you to list all users on your blacklist.\n\n**↱** **Command**: ``.v blacklist clear``\n**↳**   **Usage:** Allows you to remove all users from your blacklist.\n"
      )
      .setFooter("11PM Blacklist")
      .setTimestamp();

    return await message.reply({ embeds: [helpEmbed] });
  }
};

exports.aliases = ["bl", "blacklist", "blackl", "blist"];
