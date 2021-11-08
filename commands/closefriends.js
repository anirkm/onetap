const Discord = require("discord.js");

const { MessageButton, MessageActionRow } = require("discord-buttons");

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
			addFriend(client, message, ab);
			break;
		case "remove":
			if (!ab) {
				return message.channel.send(
					textEmbed(
						":x: | Unknown or invalid __User__ , Please try again or check your information."
					)
				);
			}
			removeFriend(client, message, ab);
			break;
		case "list":
			listFriends(client, message);
			break;
		case "clear":
			clearFriends(client, message);
			break;
		default:
			if (args[0]) {
				var user = client.getUserFromMention(message.channel.guild, args[0]);
				if (!user)
					return message.channel.send(
						textEmbed(":x: | I couldn't find any user, please try again.")
					);
				addFriend(client, message, user);
			} else {
				if (!message.guild.members.cache.get(message.author.id).voice.channel)
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
				if (onetap.ownerID !== message.author.id) {
					return message.channel.send(
						textEmbed(
							":x: | You're not the channel owner therefore you can't perform this action."
						)
					);
				}
				var frCount = client.db
					.prepare(
						`SELECT COUNT(*) count FROM cf WHERE userID = ${message.author.id}`
					)
					.get().count;
				if (frCount != 0) {
					var frMsg = await message.channel.send(
						textEmbed(":hourglass: | Please wait ...")
					);
					var frData = client.db
						.prepare(`SELECT * FROM cf WHERE userID = ${message.author.id}`)
						.all();
					var success = 0;
					var failed = 0;
					for (var friend of frData) {
						var frUser = await message.guild.members.cache.get(friend.frID);
						if (frUser) {
							try {
								console.log();
								await authorChannel.updateOverwrite(frUser, {
									CONNECT: true,
									SPEAK: true,
									VIEW_CHANNEL: true,
								});
							} catch (err) {
								console.log(err);
								failed = failed + 1;
							}
						}
					}

					return frMsg.edit(
						textEmbed(
							`:white_check_mark: | All of your ${frCount} close friends have now access to your channel.`
						)
					);
				} else {
					return message.channel.send(
						textEmbed(
							":pensive: | Action cancelled, you don't have any close friends."
						)
					);
				}
			}
	}

	function addFriend(client, message, user) {
		const userCF = client.db
			.prepare(`SELECT * FROM cf WHERE userID = ? AND frID = ?`)
			.get(message.author.id, user.id);
		const userbl = client.db
			.prepare(`SELECT * FROM bl WHERE userID = ? AND BlID = ?`)
			.get(message.author.id, user.id);
		if (!userbl && !userCF) {
			client.db
				.prepare("INSERT INTO cf VALUES (?, ?, ?, ?)")
				.run(message.guild.id, message.author.id, user.id, Date.now());
			return message.channel.send(
				textEmbed(
					`:confetti_ball: | ${user} has been successfully added to your close friends list`
				)
			);
		} else if (userbl && !userCF) {
			return message.channel.send(
				textEmbed(
					`:x: | ${user} is on your blacklist. therefore you can't add the user as friend until you un-blacklist the user.`
				)
			);
		} else {
			return message.channel.send(
				textEmbed(`:x: | ${user} is already on your close friends list.`)
			);
		}
	}

	async function sendHelp(message) {
		const helpEmbed = new Discord.MessageEmbed()
			.setAuthor(
				message.author.username,
				message.author.avatarURL({ dynamic: true, size: 4096 })
			)
			.setTitle("➤ How to use .v Cf command")
			.setDescription(
				"Allows to automatically permit your close-friends to join your future channels.\n\n**➤ How to use :**\n\n**↱ Command:** .v Cf add @User\n**↳ Usage:** Allows you to add an user to your Close-Friends list.\n\n**↱ Command:** .v Cf remove @User\n**↳ Usage:** Allows you to remove an user from your Close-Friends list.\n\n**↱ Command:** .v Cf list\n**↳ Usage:** Allows you to list all users on your Close-Friends.\n\n**↱ Command:** .v Cf clear\n**↳ Usage:** Allows you to remove all users from your Close-Friends list."
			)
			.setFooter("11PM Close-Friends")
			.setTimestamp();

		return await message.reply(helpEmbed);
	}

	function removeFriend(client, message, user) {
		const userCF = client.db
			.prepare(`SELECT * FROM cf WHERE userID = ? AND frID = ?`)
			.get(message.author.id, user.id);
		if (userCF) {
			const rmFr = client.db.prepare(
				`DELETE FROM cf WHERE userID = ? AND frID = ?`
			);
			rmFr.run(message.author.id, user.id);
			return message.channel.send(
				textEmbed(
					`:broken_heart: | ${user} has been successfully removed from your close friends list (sad)`
				)
			);
		} else {
			return message.channel.send(
				textEmbed(
					`:x: | Sorry but ${user} is not on your close friends list, please try again`
				)
			);
		}
	}

	async function listFriends(client, message) {
		var frCount = client.db
			.prepare(
				`SELECT COUNT(*) count FROM cf WHERE userID = ${message.author.id}`
			)
			.get().count;

		if (frCount == 0) {
			return message.channel.send(
				textEmbed(
					`:pensive: | You don't have any user on your close friends list, to add someone please use __.v closefriends add (user)__ `
				)
			);
		}

		var pages = [];

		var frData = client.db
			.prepare(`SELECT * FROM cf WHERE userID = ${message.author.id}`)
			.all();

		const frList = new Discord.MessageEmbed()
			.setAuthor(
				message.author.username + "'s friends list",
				message.author.avatarURL({
					dynamic: true,
					size: 4096,
				})
			)
			.setDescription(`You have a total of __${frCount}__ close friends 🥳`);

		var n = 0;
		for (var friend of frData) {
			n = n + 1;
			var count = n.toString();
			var frUser = await message.guild.members.cache.get(friend.frID);
			var date = new Date(friend.timestamp);
			pages.push([
				`\n\u200B`,
				`↱ **User**: ${frUser}\n↳ **Added**: ${date.getDate()}/${
					date.getMonth() + 1
				}/${date.getFullYear()}`,
			]);
		}

		let maxpages = pages.length / 6;

		if (maxpages % 1 != 0) maxpages = Math.floor(maxpages) + 1;
		let page = 1;
		x = 0;
		try {
			frList.addField(pages[x][0], pages[x][1], true);
		} catch {}
		try {
			frList.addField(pages[x + 1][0], pages[x + 1][1], true);
		} catch {}
		try {
			frList.addField(pages[x + 2][0], pages[x + 2][1], true);
		} catch {}
		try {
			frList.addField(pages[x + 3][0], pages[x + 3][1], true);
		} catch {}
		try {
			frList.addField(pages[x + 4][0], pages[x + 4][1], true);
		} catch {}
		try {
			frList.addField(pages[x + 5][0], pages[x + 5][1], true);
		} catch {}
		frList.setFooter(`11PM Friends - Page: ${page}/${maxpages}`);

		let frListBtnLeft = new MessageButton()
			.setStyle("red")
			.setLabel("👈")
			.setID("left_frlist");
		let frListBtnRight = new MessageButton()
			.setStyle("red")
			.setLabel("👉")
			.setID("right_frlist");

		let frListBtnRow = new MessageActionRow().addComponents(
			frListBtnLeft,
			frListBtnRight
		);

		await message.channel.send(frList, frListBtnRow).then((msg) => {
			client.on("clickButton", async (button) => {
				if (button.clicker.id != message.author.id) {
					await button.reply.send(
						"Sorry but only the message author can navigate between pages",
						true
					);
				}
				switch (button.id) {
					case "left_frlist":
						if (page === 1) return await button.reply.defer();
						page--;
						x = x - 5;
						frList.fields = [];
						try {
							frList.addField(pages[x][0], pages[x][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 1][0], pages[x + 1][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 2][0], pages[x + 2][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 3][0], pages[x + 3][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 4][0], pages[x + 4][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 5][0], pages[x + 5][1], true);
						} catch {}
						frList.setFooter(`11PM Friends - Page: ${page}/${maxpages}`);
						msg.edit(frList);
						await button.reply.defer();
						break;
					case "right_frlist":
						if (page === maxpages) return await button.reply.defer();
						page++;
						x = x + 5;
						frList.fields = [];
						try {
							frList.addField(pages[x][0], pages[x][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 1][0], pages[x + 1][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 2][0], pages[x + 2][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 3][0], pages[x + 3][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 4][0], pages[x + 4][1], true);
						} catch {}
						try {
							frList.addField(pages[x + 5][0], pages[x + 5][1], true);
						} catch {}
						frList.setFooter(`11PM Friends - Page: ${page}/${maxpages}`);
						msg.edit(frList);
						await button.reply.defer();
						break;
					default:
						return;
				}
			});
		});
	}

	async function clearFriends(client, message) {
		var frCount = client.db
			.prepare(
				`SELECT COUNT(*) count FROM cf WHERE userID = ${message.author.id}`
			)
			.get().count;

		if (frCount == 0) {
			return message.channel.send(
				textEmbed(
					`:pensive: | You don't have any user on your close friends list, to add someone please use __.v closefriends add (user)__ `
				)
			);
		}

		const confirmation = await message.channel.send(
			textEmbed(
				`:question: | Are you sure u want to remove ${frCount} user from your close friends, this action is irreversible! (reply with yes or no within 30 seconds)`
			)
		);
		const answers = ["y", "yes", "n", "no"];
		const filter = (m) =>
			answers.includes(m.content.toLowerCase()) &&
			m.author.id === message.author.id;

		const collector = confirmation.channel.createMessageCollector(filter, {
			max: 1,
			time: 30000,
		});

		collector.on("collect", async (m) => {
			if (
				m.content.toLowerCase() === answers[2] ||
				m.content.toLowerCase() === answers[3]
			) {
				return m.reply(
					textEmbed(`:x: | Action has been successfully cancelled.`)
				);
			}

			try {
				const rmFr = client.db.prepare(`DELETE FROM cf WHERE userID = ?`);
				var msg = await m.reply(textEmbed(`:timer: | Please wait ...`));
				await rmFr.run(message.author.id);
				return msg.edit(
					textEmbed(
						`:white_check_mark: | A total of __${frCount}__ close friends were removed from your account`
					)
				);
			} catch (error) {
				console.log(error);
			}
		});

		collector.on("end", (collected, reason) => {
			if (reason === "time") {
				return confirmation.edit(
					textEmbed(
						`:hourglass_flowing_sand: | it's been a 30 seconds without any confirmation. The action has been cancelled`
					)
				);
			}
		});
	}
};

exports.aliases = ["cf", "friends", "friend", "fr", "f"];
