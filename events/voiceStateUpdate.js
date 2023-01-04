const { Permissions } = require("discord.js");

const queue = require("../utils/queue");

module.exports = async (client, oldMember, newMember) => {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;
  let cate = newMember.guild.channels.cache.find(
    (x) => x.name === "YOUR ROOM YOUR RULES"
  );
  let us = newMember.guild.members.cache.get(newMember.id);

  let jailRole = await newMember.guild.roles.cache.find(
    (r) => r.id === "1037823198361817088" //1037823198361817088 // d : 859855728990748724
  );
  let verified = await newMember.guild.roles.cache.find(
    (r) => r.id === "1037823799502045204" //1037823799502045204 // d: 859855740687351828
  );
  let everyonerole = newMember.guild.roles.everyone;
  if (!jailRole) return console.log("no jail role");
  if (!verified) return console.log("no verified role");

  if (newUserChannel) {
    if (
      newUserChannel.name != "One Tap" &&
      newUserChannel.position != 0 &&
      newUserChannel.parent == cate
    ) {
      let permMap = await newUserChannel.permissionOverwrites.cache;

      if (!permMap) return;

      if (!Object.fromEntries(permMap)[newMember.id]) return;

      if (
        Object.fromEntries(permMap)[newMember.id].deny.any(
          Permissions.FLAGS.CONNECT,
          true
        )
      ) {
        try {
          await newMember.member.voice.disconnect(
            "Tried to bypass onetap rejection."
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  if (newUserChannel) {
    if (
      newUserChannel.name == "One Tap" &&
      newUserChannel.position == 0 &&
      newUserChannel.parent == cate
    ) {
      queue.createChannelQueue.add(
        async () => {
          await newMember.guild.channels
            .create(`${us.displayName}'s Channel`, {
              type: "GUILD_VOICE",
              parent: cate,
              userLimit: 0,
              reason: `OneTap created by ${newMember.member.user.username}`,
            })
            .then(async function (chan) {
              await chan.lockPermissions();
              await chan.permissionOverwrites.edit(newMember.id, {
                CONNECT: true,
                VIEW_CHANNEL: true,
                SPEAK: true,
                CREATE_INSTANT_INVITE: true,
              });
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
                  var BlUser = await newMember.guild.members.cache.get(
                    Bliend.BlID
                  );
                  if (BlUser) {
                    try {
                      await chan.permissionOverwrites.edit(BlUser, {
                        CONNECT: false,
                        SPEAK: false,
                      });
                    } catch {
                      return;
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
                  var FRUser = await newMember.guild.members.cache.get(
                    friend.frID
                  );
                  if (FRUser) {
                    try {
                      await chan.permissionOverwrites.edit(FRUser, {
                        CONNECT: true,
                        SPEAK: true,
                        VIEW_CHANNEL: true,
                      });
                    } catch {
                      return;
                    }
                  }
                }
              }
              return await newMember.member.voice.setChannel(
                chan,
                "Onetap creation."
              );
            })
            .catch((e) => {
              return console.log("err at create channel", e);
            });
        },
        { user: `${newMember.member.user.username}` }
      );
    }
  }
  if (oldUserChannel) {
    oldMember.guild.channels.cache.map(async (channel) => {
      if (channel.parent === cate) {
        if (channel.name === "One Tap" && channel.position == 0) return;
        if (channel.type !== "GUILD_VOICE") return;
        if (channel.parent !== cate) return;
        if (channel.members.size == 0) {
          queue.deleteChannelQueue.add(async () => {
            await channel.delete().catch((err) => {});
          });
        }
      }
    });
  }
};
