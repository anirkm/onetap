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
	let ided = message.guild.id;

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

	if (onetap.ownerID === message.author.id) {
		return message.channel.send(
			textEmbed(":x: | The ownership of this channel is already yours")
		);
	}

	if (
		guild.members.cache.get(onetap.ownerID).voice.channel &&
		guild.members.cache.get(onetap.ownerID).voice.channel.id ===
			onetap.channelID
	) {
		return message.channel.send(
			textEmbed(":x: | The current channel owner is still connected. This command is only usable when the owner is disconnected from his channel.")
		);
	} else {
		const updateOwner = client.db.prepare(
			`UPDATE channels SET ownerID = ? WHERE channelID = ?`
		);
		updateOwner.run(message.author.id, onetap.channelID);
		message.channel.send(
			textEmbed(
				`:star2: | Congrats! channel claimed successfully, the channel ownership is now yours!`
			)
		);
	}
};
