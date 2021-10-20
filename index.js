const Discord = require('discord.js');
const { Database } = require("quickmongo");
const db = new Database("DB_LINK_HERE");
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = "$"

db.on("ready", () => {
    console.log("Database connected!");  
  });
client.on('ready', () => {
    console.log("App Connected! " , client.user.tag)
})
client.commands= new Discord.Collection();

const { join } = require('path');
const { readdirSync } = require('fs');
const commandFiles = readdirSync(join(__dirname, "commands")).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(join(__dirname, "commands", `${file}`));
    client.commands.set(command.name , command);
}

client.on("message", async message => {
       if(message.author.bot) return;
      if(message.channel.type === 'dm') return;
  
      if(message.content.startsWith(prefix)) {
          
 
          const args = message.content.slice(prefix.length).trim().split(/ +/);
  
          const command = args.shift().toLowerCase();
  
          if(!client.commands.has(command)) return;
  
  
          try {
              client.commands.get(command).run(client, message, args, db, prefix);
  
          } catch (error){
              console.error(error);
          }
       }
  })
client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();
  
    if (user.bot) return;
    let ticketid = await db.get(`tickets_${reaction.message.guild.id}`);
    if(!ticketid) return;
    if(reaction.message.id == ticketid && reaction.emoji.name == '🎟️') {
      db.add(`ticketnumber_${reaction.message.guild.id}`, 1)
      let ticketnumber = await db.get(`ticketnumber_${reaction.message.guild.id}`)
      if (ticketnumber === null) ticketnumber = "1"
      reaction.users.remove(user);
   
        reaction.message.guild.channels.create(`ticket-${ticketnumber}`, { 
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
          let data = {
            channelid: channel.id
          }
          db.push(`tickets`, data).then(console.log)

          channel.send(`<@${user.id}>`).then(log => {db.set(`mention_${channel.id}`, log.id)})
          db.set(`ticketauthor_${channel.id}`, user.id)
let icon = reaction.message.guild.iconURL()
          let ticketmsg = await channel.send(new Discord.MessageEmbed()
          .setTitle(`${user.username} Ticket`)
          .setDescription("Our Staff Team Will Be With you soon\nTo Close Ticket React With 🔐")
          .setFooter(reaction.message.guild.name,icon)
          .setTimestamp()
            );    
  
              ticketmsg.react('🔐')
              console.log(`${ticketmsg.id}`)
              db.set(`closeticket_${channel.id}`, ticketmsg.id)
        })
    }
  });
  client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();
  
    if (user.bot) return;
    let ticketid = await db.get(`closeticket_${reaction.message.channel.id}`);
    if(!ticketid) return;
    if(reaction.message.id == ticketid && reaction.emoji.name == '🔐') {
        let author = await db.get(`ticketauthor_${reaction.message.channel.id}`)
        reaction.message.channel.updateOverwrite(author, { SEND_MESSAGES: false, VIEW_CHANNEL: false});
    }})


    client.login("")
