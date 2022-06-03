const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  const user = message.author;
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const embed = new Discord.MessageEmbed()
    .setAuthor(
      "・11PM World One-Tap Help",
      message.author.avatarURL({ format: "gif", dynamic: true })
    )
    .setColor(randomColor)
    .setDescription(
      "`🔑`・`.v Permit`\n<a:11pm_Slid:877597848865218572> **Give a user access to join the channel**\n`👋` ・`.v Reject`\n<a:11pm_Slid:877597848865218572> **Remove access to a user from joining the channel**\n`♾️` ・`.v Limit`\n<a:11pm_Slid:877597848865218572> **Limit the number of users in the channel**\n`🔒` ・`.v Lock`\n<a:11pm_Slid:877597848865218572> **Block the users from joining the channel**\n`🔓` ・`.v Unlock`\n<a:11pm_Slid:877597848865218572> **Unblock the channel**\n`☄️` ・`.v Claim`\n<a:11pm_Slid:877597848865218572> **Make the channel visible**\n`👻` ・`.v Ghost` (Must Have <@&775898112979501106> Rank!)\n<a:11pm_Slid:877597848865218572> **Make the channel invisible**\n`👀` ・`.v Show` (Must Have <@&775898112979501106> Rank!)\n<a:11pm_Slid:877597848865218572> **Make the channel visible**\n`👑` ・`.v Owner ` \n<a:11pm_Slid:877597848865218572> **Shows current channel owner**\n`👑` ・`.v Owner set` \n<a:11pm_Slid:877597848865218572> **Transfer channel ownership to someone else**\n`😎` ・`.v Cf Help` \n<a:11pm_Slid:877597848865218572> **Shows how to use Close Friends Feature**\n`💀` ・`.v bl Help` \n<a:11pm_Slid:877597848865218572> **Shows how to use Blacklist Feature**"
    );

  message.channel.send({ embeds: [embed] });
};
