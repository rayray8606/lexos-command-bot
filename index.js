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
const REPO_OWNER = 'rayray8606'; // Your GitHub username
const REPO_NAME = 'boss-babes-hq'; // The website repository name
const FILE_PATH = 'index.html'; // The file we are editing

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: ${client.user.tag} ONLINE. Write-Access Enabled.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // The Status Command
  if (message.content === '!status') {
    message.reply('👑 **LexOS Command:** Systems optimal. Write-Access pipeline is hot.');
  }

  // The Update Timer Command
  if (message.content.startsWith('!update-timer')) {
    const newDate = message.content.replace('!update-timer ', '').trim();
    
    if(!newDate || newDate === '!update-timer') {
        return message.reply('⚠️ **Syntax Error:** Please provide a date. Example: `!update-timer June 15, 2026 15:00:00`');
    }

    message.reply(`⏳ **Command Acknowledged:** Initiating GitHub override for target date: ${newDate}...`);

    try {
      // 1. Get the current file from GitHub
      const getFileResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      const fileData = await getFileResponse.json();
      
      // Decode the code
      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');

      // 2. Find and Replace the Target Date in the code
      const dateRegex = /const targetDate = new Date\(".*?"\)\.getTime\(\);/;
      const replacement = `const targetDate = new Date("${newDate}").getTime();`;
      
      if (!content.match(dateRegex)) {
          return message.reply('❌ **Error:** Could not locate the timer variable in the source code.');
      }

      content = content.replace(dateRegex, replacement);

      // 3. Push the new code back to GitHub
      const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: `LexOS Command Override: Timer updated to ${newDate}`,
          content: Buffer.from(content).toString('base64'),
          sha: fileData.sha // Required by GitHub to prove we have the latest version
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
