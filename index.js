const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('LexOS Global Network: Synchronized.'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// CHANNEL CONFIGURATION
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
let customCommands = new Map();

client.on('ready', () => {
  console.log(`[ROBERTS ENT. SYSTEM]: LexOS Online. All channels linked.`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // --- 1. THE AI BRAIN (Restricted to LEXOS BRAIN) ---
  if (command === '!ask') {
    if (message.channel.id !== CHANNELS.LEXOS_BRAIN) return;
    const prompt = args.slice(1).join(' ');
    try {
      const result = await model.generateContent(`You are LexOS, the elite AI Chief of Staff for Commander Lexieee. Tone: Confident, Professional, Strategic. ${prompt}`);
      message.reply(result.response.text());
    } catch (e) { message.reply('❌ Link Error.'); }
  }

  // --- 2. TIKTOK BROADCAST (Output to TIKTOK FEED) ---
  if (command === '!tiktok') {
    const link = args[1];
    const targetChannel = client.channels.cache.get(CHANNELS.TIKTOK_FEED);
    const embed = new EmbedBuilder()
      .setColor('#00f2ea')
      .setTitle('🚀 NEW CONTENT DETECTED')
      .setDescription(`@everyone **The Commander is trending.** Flood the video now! \n\n${link}`)
      .setFooter({ text: 'Lexie In Charge.' });
    targetChannel.send({ content: '@everyone', embeds: [embed] });
    if (message.channel.id !== CHANNELS.TIKTOK_FEED) message.reply('✅ Broadcast Sent to TikTok Feed.');
  }

  // --- 3. META INTEL (Output to WARZONE) ---
  if (command === '!meta') {
    const targetChannel = client.channels.cache.get(CHANNELS.WARZONE);
    const embed = new EmbedBuilder()
      .setColor('#ff1a1a')
      .setTitle('🔫 CURRENT ELITE META')
      .addFields({ name: '🔥 BO7 / Warzone', value: 'XM4 Damage Build | C9 Speed Build' });
    targetChannel.send({ embeds: [embed] });
    if (message.channel.id !== CHANNELS.WARZONE) message.reply('✅ Intel dropped in Warzone channel.');
  }

  // --- 4. SQUAD RALLY (Output to SQUAD RALLY) ---
  if (command === '!squad-up') {
    const targetChannel = client.channels.cache.get(CHANNELS.SQUAD_RALLY);
    targetChannel.send('🚨 **WAR ROOM ALERT:** @everyone Lexie is dropping in. Fill the lobby now. Join Voice.');
    if (message.channel.id !== CHANNELS.SQUAD_RALLY) message.reply('✅ Rally initiated in Squad Rally.');
  }

  // --- 5. WEB OPS & DYNAMIC CMDS (Restricted to WEB OPS / BRAIN) ---
  if (command === '!update-timer') {
    if (message.channel.id !== CHANNELS.WEB_OPS) return;
    const newDate = args.slice(1).join(' ');
    message.reply('⏳ Executing website override...');
    try {
      const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      });
      const fileData = await getFile.json();
      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      content = content.replace(/const targetDate = new Date\(".*?"\)\.getTime\(\);/, `const targetDate = new Date("${newDate}").getTime();`);
      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
        body: JSON.stringify({ message: 'LexOS Override', content: Buffer.from(content).toString('base64'), sha: fileData.sha })
      });
      message.reply('✅ Website Rewritten.');
    } catch (e) { message.reply('❌ Push Failed.'); }
  }

  if (command === '!add-cmd') {
    if (message.channel.id !== CHANNELS.LEXOS_BRAIN) return;
    customCommands.set(args[1].toLowerCase(), args.slice(2).join(' '));
    message.reply(`✅ Learned \`${args[1]}\`.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
