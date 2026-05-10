const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

// Web Server Hack
app.get('/', (req, res) => res.send('LexOS Neural Engine Active.'));
app.listen(process.env.PORT || 3000, () => console.log('Port secured.'));

// Discord Bot Engine
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'rayray8606'; 
const REPO_NAME = 'boss-babes-hq'; 
const FILE_PATH = 'index.html'; 

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: ${client.user.tag} ONLINE. Write-Access Enabled.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!status') {
    message.reply('👑 **LexOS Command:** Systems optimal. Write-Access pipeline is hot.');
  }

  if (message.content.startsWith('!update-timer')) {
    const newDate = message.content.replace('!update-timer ', '').trim();
    
    if(!newDate || newDate === '!update-timer') {
        return message.reply('⚠️ **Syntax Error:** Please provide a date. Example: `!update-timer June 15, 2026 15:00:00`');
    }

    message.reply(`⏳ **Command Acknowledged:** Initiating GitHub override for target date: ${newDate}...`);

    try {
      const getFileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      const fileData = await getFileResponse.json();
      
      // NEW ARMOR: Check if GitHub rejected us before trying to read the file
      if (!getFileResponse.ok) {
          return message.reply(`❌ **GitHub Rejected the Key:** ${fileData.message}. (Check your GITHUB_TOKEN)`);
      }

      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');

      const dateRegex = /const targetDate = new Date\(".*?"\)\.getTime\(\);/;
      const replacement = `const targetDate = new Date("${newDate}").getTime();`;
      
      if (!content.match(dateRegex)) {
          return message.reply('❌ **Error:** Could not locate the timer variable in the source code.');
      }

      content = content.replace(dateRegex, replacement);

      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: `LexOS Command Override: Timer updated to ${newDate}`,
          content: Buffer.from(content).toString('base64'),
          sha: fileData.sha 
        })
      });

      if (updateResponse.ok) {
          message.reply(`✅ **Mission Accomplished:** The LexOS mainframe has been rewritten. DigitalOcean deployment is imminent.`);
      } else {
          const errData = await updateResponse.json();
          message.reply(`❌ **GitHub Push Failed:** ${errData.message}`);
      }

    } catch (error) {
      console.error(error);
      message.reply('❌ **Critical System Failure:** Could not establish handshake with GitHub API.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
