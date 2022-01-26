client.on("guildMemberUpdate", async (oldMember, newMember) => {
  let txtChannel = await client.channels.cache.get("803359668054786118");
  let oldRoleIDs = [];
  let newRoleIDs = [];
  let permittedUsers = ["428692060619407370", "490667823392096268"];

  oldMember.roles.cache.each((role) => {
    oldRoleIDs.push(role.id);
  });
  newMember.roles.cache.each((role) => {
    newRoleIDs.push(role.id);
  });

  if (newRoleIDs.length > oldRoleIDs.length) {
    function filterOutOld(id) {
      for (var i = 0; i < oldRoleIDs.length; i++) {
        if (id === oldRoleIDs[i]) {
          return false;
        }
      }
      return true;
    }

    let onlyRole = newRoleIDs.filter(filterOutOld);

    if (onlyRole.length > 0) {
      async function cleanup() {
        for (let i = 0; i < onlyRole.length; i++) {
          let role = await newMember.guild.roles.cache.get(onlyRole[i]);
          if (role) {
            if (
              role.hasPermission("ADMINISTRATOR") ||
              role.hasPermission("MANAGE_ROLES") ||
              role.hasPermission("BAN_MEMBERS") ||
              role.hasPermission("KICK_MEMBERS") ||
              role.hasPermission("MANAGE_GUILD")
            ) {
              try {
                await newMember.roles.remove(IDnum);
              } catch (e) {
                console.error("role foq meni");
              }
            }
          }
        }
      }

      const log = await message.guild
        .fetchAuditLogs({ limit: 1, type: "MEMBER_ROLE_UPDATE" })
        .then((logs) => logs.entries.first());

      if (!log) {
        console.log(
          "couldn't fetch any audit log but for security the task will continue"
        );
        await cleanup();
      } else {
        const { executor, target } = log;

        if (
          target.id == newMember.id &&
          !permittedUsers.contains(executor.id)
        ) {
          await cleanup();
        }
      }
    }
  }
});
