const Discord = require("discord.js")
 
module.exports = {
    name: "setup-ticket",
    description: "Rename Ticket",
    run: async (client, message, args, db, prefix) => {
      let channel = message.mentions.channels.first();
        if(!channel) {
            let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag , message.author.displayAvatarURL())
            .setDescription(`**Mention Channel**`)
            .setTimestamp()
            return message.channel.send(embed)
        }
        let icon = message.guild.iconURL()
        let ticket = new Discord.MessageEmbed()
        .setAuthor(message.guild.name, icon)
        .setDescription(`To Open Ticket React With 🎟️`)
        .setFooter(client.user.tag, client.user.displayAvatarURL())
        .setFooter(message.guild.name , icon)
        .setTimestamp()
 
    channel.send(ticket).then(om => {
       om.react(`🎟️`)
      db.set(`tickets_${message.guild.id}`, om.id).then(console.log);
    })
    }}
