const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

// 24/7 Uptime Server
app.get('/', (req, res) => res.send('LexOS Neural Engine: Active.'));
app.listen(process.env.PORT || 3000, () => console.log('Uptime channel secured.'));

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Secrets
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'rayray8606'; 
const REPO_NAME = 'boss-babes-hq'; 
const FILE_PATH = 'index.html';

// Dynamic Database (Stored in memory for speed)
let customCommands = new Map();

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: ${client.user.tag} ONLINE. Lexieee Intelligence Mode Active.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // 1. DYNAMIC COMMAND BUILDER (UNLIMITED COMMANDS)
  if (command === '!add-cmd') {
    const newTrigger = args[1];
    const response = args.slice(2).join(' ');
    if (!newTrigger || !response) return message.reply('⚠️ **Syntax:** `!add-cmd [trigger] [response]`');
    
    customCommands.set(newTrigger.toLowerCase(), response);
    message.reply(`✅ **Intelligence Updated:** I have learned the \`${newTrigger}\` command, Commander.`);
  }

  // Check if it's a learned custom command
  if (customCommands.has(command)) {
    return message.channel.send(customCommands.get(command));
  }

  // 2. TIKTOK VIRAL ALERT
  if (command === '!tiktok') {
    const link = args[1];
    if (!link) return message.reply('⚠️ Provide the link, Commander.');
    const tiktokEmbed = new EmbedBuilder()
      .setColor('#00f2ea')
      .setTitle('🚀 TIKTOK ALGORITHM PUSH')
      .setDescription(`@everyone **NEW CONTENT ALERT!** \n\nWe need maximum engagement in the first 60 seconds! \n\n[CLICK HERE TO VIEW VIDEO](${link})`)
      .setThumbnail('https://i.imgur.com/vHq7j0U.png') // TikTok Icon
      .setFooter({ text: 'Like. Comment. Share. Repeat.' });
    message.channel.send({ content: '@everyone', embeds: [tiktokEmbed] });
  }

  // 3. WARZONE & BO7 META DROP
  if (command === '!meta') {
    const metaEmbed = new EmbedBuilder()
      .setColor('#ff1a1a')
      .setTitle('🔫 LEXIE\'S ELITE META BUILDS')
      .addFields(
        { name: '🔥 BO7 Primary: XM4', value: 'High Damage/Low Recoil Build' },
        { name: '💨 Warzone SMG: C9', value: 'Maximum Movement Speed Build' }
      )
      .setImage('https://i.imgur.com/Y8K2VfW.png'); // Placeholder for a weapon graphic
    message.reply({ embeds: [metaEmbed] });
  }

  // 4. WEBSITE MAINframe OVERRIDE
  if (command === '!update-timer') {
    const newDate = args.slice(1).join(' ');
    message.reply(`⏳ **Command Acknowledged:** Initiating GitHub override for target date: ${newDate}...`);
    
    try {
      const getFileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      const fileData = await getFileResponse.json();
      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      const dateRegex = /const targetDate = new Date\(".*?"\)\.getTime\(\);/;
      const replacement = `const targetDate = new Date("${newDate}").getTime();`;
      content = content.replace(dateRegex, replacement);

      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: `LexOS Command: System Intelligence Update`,
          content: Buffer.from(content).toString('base64'),
          sha: fileData.sha 
        })
      });
      if (updateResponse.ok) message.reply(`✅ **Mission Accomplished.** Website countdown is updated.`);
    } catch (error) { message.reply('❌ **System Failure.** Handshake lost.'); }
  }
});

client.login(process.env.DISCORD_TOKEN);
