const Discord = require("discord.js");

const { prefix } = require("../config/cfg.json");

async function missingArgs(message, cmd, usage, example) {
  const embed = new Discord.MessageEmbed()
    .setAuthor(
      "Missing Arguments",
      "https://cdn.discordapp.com/attachments/869959433340477450/894231178842877952/PngItem_1334519.png"
    )
    .setDescription(
      `➥ **Command**: ${prefix}${cmd}\n➥ **Usage**:  ${prefix}${cmd} ${usage}\n➥ **Example**:  ${prefix}${cmd}  ${example}`
    )
    .setFooter("Executed by " + message.author.tag)
    .setTimestamp();

  return await message.channel.send({ embeds: [embed] });
}

module.exports = {
  missingArgs: missingArgs,
};
