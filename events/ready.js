module.exports = (client) => {
    console.log(`Connecté en tant que: ${client.user.tag}`);
    client.user.setStatus(`.v help`)
    console.log('---------------------------------------------');


    client.user.setActivity({ type: "STREAMING", url: "https://www.twitch.tv/monstercat", name:"*:･ﾟ✧(ꈍᴗꈍ)✧･ﾟ:*" });


}