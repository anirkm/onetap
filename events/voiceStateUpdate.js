module.exports = async (client, oldMember, newMember) => {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;
  let cate = newMember.guild.channels.cache.find(
    (x) => x.name === "Voice Channels"
  );
  let us = newMember.guild.members.cache.get(newMember.id);

  let jailRole = await newMember.guild.roles.cache.find(
    (r) => r.id === "791081032207695893"
  );
  let verified = await newMember.guild.roles.cache.find(
    (r) => r.id === "809087546088357908"
  );
  let everyonerole = newMember.guild.roles.everyone;
  if (!jailRole) return console.log("no jail role");
  if (!verified) return console.log("no verified role");

  if (newUserChannel) {
    if (newUserChannel.name == "One Tap" && newUserChannel.position == 0) {
      newMember.guild.channels
        .create(`${us.displayName}'s Channel`, {
          type: "voice",
          parent: cate,
          userLimit: 0,
          permissionOverwrites: [
            {
              id: newMember.id,
              allow: [
                "CONNECT",
                "VIEW_CHANNEL",
                "SPEAK",
                "CREATE_INSTANT_INVITE",
              ],
            },
            {
              id: jailRole,
              deny: [
                "CONNECT",
                "SPEAK",
                "VIEW_CHANNEL",
                "MUTE_MEMBERS",
                "MANAGE_ROLES",
                "CREATE_INSTANT_INVITE",
              ],
            },
            {
              id: everyonerole,
              deny: ["VIEW_CHANNEL"],
            },
            {
              id: verified,
              allow: ["VIEW_CHANNEL"],
            },
          ],
        })
        .then(async function (chan) {
          try {
            newMember.member.voice.setChannel(chan);
          } catch {}
          await client.db
            .prepare("INSERT INTO channels VALUES (?, ?, ?)")
            .run(newMember.guild.id, chan.id, newMember.id);
          var BlCount = client.db
            .prepare(
              `SELECT COUNT(*) count FROM bl WHERE userID = ${newMember.id}`
            )
            .get().count;
          if (BlCount != 0) {
            var BlData = client.db
              .prepare(`SELECT * FROM bl WHERE userID = ${newMember.id}`)
              .all();
            for (var Bliend of BlData) {
              var BlUser = await newMember.guild.members.cache.get(Bliend.BlID);
              if (BlUser) {
                try {
                  await chan.updateOverwrite(BlUser, {
                    CONNECT: false,
                    SPEAK: false,
                  });
                } catch {
                  let test = null;
                }
              }
            }
          }
          var FrCount = client.db
            .prepare(
              `SELECT COUNT(*) count FROM cf WHERE userID = ${newMember.id}`
            )
            .get().count;
          if (FrCount != 0) {
            var FlData = client.db
              .prepare(`SELECT * FROM cf WHERE userID = ${newMember.id}`)
              .all();
            for (var friend of FlData) {
              var FRUser = await newMember.guild.members.cache.get(friend.frID);
              if (FRUser) {
                try {
                  await chan.updateOverwrite(FRUser, {
                    CONNECT: true,
                    SPEAK: true,
                    VIEW_CHANNEL: true,
                  });
                } catch {
                  let test = null;
                }
              }
            }
          }
        });
    }
  }
  if (oldUserChannel) {
    oldMember.guild.channels.cache.map(async (channel) => {
      if (channel.parent === cate) {
        if (channel.name === "One Tap" && channel.position == 0) return;
        if (channel.type !== "voice") return;
        if (channel.parent !== cate) return;
        if (channel.members.size == 0) {
          setTimeout(async function () {
            try {
              await channel.delete();
            } catch {
              return;
            }
          }, 250);
        }
      }
    });
  }
};
