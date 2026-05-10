const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

// The Web Server Hack (Keeps the cloud host happy)
app.get('/', (req, res) => res.send('LexOS Neural Engine is Active.'));
app.listen(process.env.PORT || 3000, () => console.log('Port connection secured.'));

// The Discord Bot Engine
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: ${client.user.tag} is ONLINE and securing the perimeter.`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!status') {
    message.reply('👑 **LexOS Command:** Systems are optimal. All Roberts Ent. servers are hot. Awaiting orders, Commander.');
  }
});

client.login(process.env.DISCORD_TOKEN);
