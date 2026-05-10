const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('LexOS Neural Engine: Online.'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// BRAIN INITIALIZATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CHANNELS = {
    TIKTOK_FEED: '1503106758028034068',
    WARZONE: '1498013372636201194',
    SQUAD_RALLY: '1503107308560060446',
    WEB_OPS: '1503107726618919052',
    LEXOS_BRAIN: '1503107593814413412'
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'rayray8606'; 
const REPO_NAME = 'boss-babes-hq'; 
const FILE_PATH = 'index.html';

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: LexOS Online. Neural Link established.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // --- THE AI BRAIN (!ask) ---
  if (command === '!ask' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    const prompt = args.slice(1).join(' ');
    if (!prompt) return message.reply('👑 **LexOS:** I am listening, Commander.');
    
    try {
      const result = await model.generateContent(`You are LexOS, the elite AI Chief of Staff for Commander Lexieee. Tone: Professional and Strategic. ${prompt}`);
      const response = await result.response;
      message.reply(response.text());
    } catch (error) {
      // THIS WILL NOW TELL US THE REAL ERROR
      console.error("BRAIN ERROR:", error);
      message.reply(`❌ **Neural Link Error:** ${error.message || "Unknown Connection Issue"}`);
    }
  }

  // --- TIKTOK / META / SQUAD (Broadcasting to public channels) ---
  if (command === '!tiktok') {
    const target = client.channels.cache.get(CHANNELS.TIKTOK_FEED);
    const embed = new EmbedBuilder().setColor('#00f2ea').setTitle('🚀 NEW CONTENT').setDescription(`@everyone **Commander Lexieee is live.** \n\n${args[1]}`);
    if (target) target.send({ content: '@everyone', embeds: [embed] });
  }

  if (command === '!meta') {
    const target = client.channels.cache.get(CHANNELS.WARZONE);
    const embed = new EmbedBuilder().setColor('#ff1a1a').setTitle('🔫 ELITE META').addFields({ name: '🔥 BO7 / Warzone', value: 'XM4 Build | C9 Speed Build' });
    if (target) target.send({ embeds: [embed] });
  }

  if (command === '!squad-up') {
    const target = client.channels.cache.get(CHANNELS.SQUAD_RALLY);
    if (target) target.send('🚨 **WAR ROOM ALERT:** @everyone Lexie is dropping in. Fill the lobby.');
  }

  // --- WEBSITE OVERRIDE ---
  if (command === '!update-timer' && message.channel.id === CHANNELS.WEB_OPS) {
    const newDate = args.slice(1).join(' ');
    message.reply('⏳ Executing override...');
    try {
      const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      });
      const fileData = await getFile.json();
      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      content = content.replace(/const targetDate = new Date\(".*?"\)\.getTime\(\);/, `const targetDate = new Date("${newDate}").getTime();`);
      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          method: 'PUT', headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
          body: JSON.stringify({ message: 'LexOS Override', content: Buffer.from(content).toString('base64'), sha: fileData.sha })
      });
      message.reply('✅ Website Updated.');
    } catch (e) { message.reply('❌ Push Failed.'); }
  }
});

client.login(process.env.DISCORD_TOKEN);
