const Discord = require("discord.js");

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

	const premiumRoles = [];
	premiumRoles.push("Top Donator 💸");
	premiumRoles.push("Luxury donator ⚜️");
	premiumRoles.push("Filthy Rich 💸");
	premiumRoles.push("$upreme Donator 💎");
	premiumRoles.push("Fancy Donator 💵");
	premiumRoles.push("Premium Donator 💰");
	premiumRoles.push("Premium Quality‧ ☆༉");


	let roles = [];

	for (const role of premiumRoles) {
		var rl = client.findRole(message.guild, role);
		if (rl) {
			roles.push(client.findRole(message.guild, role));
		}
	}

	flag = false;
	roles.forEach((role) => {
		if (message.member.roles.cache.find((r) => r.id === role.id) || message.member.hasPermission("ADMINISTRATOR")) flag = true;
	});
	if (flag === false)
		return message.channel.send(
			textEmbed(":x: | Sorry but this feature is only reserved for **Premium Quality** users and **Donators** ( for the moment )")
		);

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
		.updateOverwrite(verified, { VIEW_CHANNEL: false })
		.then((test) => {
			message.channel.send(
				textEmbed(
					`:ghost: | Ghost mode is now active, only you and permitted users can see this channel.`
				)
			);
		});
};
exports.aliases = ["hide"];
