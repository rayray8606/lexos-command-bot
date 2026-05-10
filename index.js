const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const express = require('express');

// --- 1. THE HEARTBEAT ENGINE (KEEPS RENDER AWAKE) ---
const app = express();
const parser = new Parser();
app.get('/', (req, res) => res.status(200).send('LexOS 3.1: Systems Nominal. Heartbeat Optimal.'));
app.listen(process.env.PORT || 10000, () => console.log(`[NETWORK]: Web Port 10000 Locked.`));

// --- 2. INITIALIZATION ---
const SESSION_ID = Math.floor(1000 + Math.random() * 9000);
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

const CHANNELS = {
    TIKTOK_FEED: '1503106758028034068',
    WARZONE: '1498013372636201194',
    SQUAD_RALLY: '1503107308560060446',
    WEB_OPS: '1503107726618919052',
    LEXOS_BRAIN: '1503107593814413412'
};

let lastVideoID = '';
let tiktokHandle = ''; 
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'rayray8606'; 
const REPO_NAME = 'boss-babes-hq';
const FILE_PATH = 'index.html';

// --- 3. THE SENTINEL (TIKTOK AUTO-TRACKER) ---
client.on('ready', () => {
  console.log(`[SYSTEM ONLINE]: LexOS 3.1 | Session: ${SESSION_ID}`);
  setInterval(trackTikTok, 25 * 60 * 1000); // Scans every 25 mins
});

async function trackTikTok() {
    if (!tiktokHandle) return;
    try {
        const feed = await parser.parseURL(`https://tok.artemislena.eu.org/${tiktokHandle}/rss`);
        const latestVideo = feed.items[0];
        if (latestVideo && latestVideo.id !== lastVideoID) {
            lastVideoID = latestVideo.id;
            const channel = client.channels.cache.get(CHANNELS.TIKTOK_FEED);
            const embed = new EmbedBuilder()
                .setColor('#ff1a1a')
                .setTitle('🚀 NEW CONTENT: BOSS BABES HQ')
                .setURL(latestVideo.link)
                .setDescription(`@everyone **The Commander just posted!** \n\nFlood the comments now for the algorithm! \n\n[WATCH HERE](${latestVideo.link})`)
                .setFooter({ text: `LexOS Sentinel | ID: ${SESSION_ID}` });
            if (channel) channel.send({ content: '@everyone', embeds: [embed] });
        }
    } catch (e) { console.log("[SENTINEL]: Polling..."); }
}

// --- 4. COMMAND LOGIC ---
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // !version
  if (command === '!version') {
    return message.reply(`🛡️ **LexOS Core V3.1**\n**Status:** Active\n**Session ID:** \`${SESSION_ID}\`\n**Brain:** Gemini 3.1 Flash-Lite`);
  }

  // !ask (The AI Brain)
  if (command === '!ask' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    const prompt = args.slice(1).join(' ');
    if (!prompt) return message.reply('👑 **LexOS:** Awaiting instructions, Commander.');
    try {
      const result = await model.generateContent(`You are LexOS, the elite AI Chief of Staff for Commander Lexieee and Boss Babes HQ. Task: ${prompt}`);
      const responseText = result.response.text();
      // Split message if over 2000 characters
      for (let i = 0; i < responseText.length; i += 1900) {
          await message.reply(responseText.substring(i, i + 1900));
      }
    } catch (e) { message.reply('❌ Neural link timed out. Restart Render service.'); }
  }

  // !set-tiktok
  if (command === '!set-tiktok' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    tiktokHandle = args[1]?.replace('@', '');
    message.reply(`✅ **Sentinel Locked:** Tracking @${tiktokHandle}. First scan initiating...`);
    trackTikTok();
  }

  // !squad-up
  if (command === '!squad-up') {
    const target = client.channels.cache.get(CHANNELS.SQUAD_RALLY);
    if (target) target.send('🚨 **WAR ROOM ALERT:** @everyone Lexie is dropping in. Fill the lobby now for matchmaking/dual play. Join Voice.');
  }

  // !meta
  if (command === '!meta') {
    const target = client.channels.cache.get(CHANNELS.WARZONE);
    const embed = new EmbedBuilder().setColor('#00f2ea').setTitle('🔫 CURRENT ELITE META').addFields({ name: '🔥 BO7 / Warzone', value: 'XM4 Build | C9 Speed Build' });
    if (target) target.send({ embeds: [embed] });
  }

  // !update-timer (Website Override)
  if (command === '!update-timer' && message.channel.id === CHANNELS.WEB_OPS) {
    const newDate = args.slice(1).join(' ');
    message.reply('⏳ Executing Website Override...');
    try {
      const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, { headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` } });
      const fileData = await getFile.json();
      let content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      content = content.replace(/const targetDate = new Date\(".*?"\)\.getTime\(\);/, `const targetDate = new Date("${newDate}").getTime();`);
      await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
          method: 'PUT', headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
          body: JSON.stringify({ message: 'LexOS Override', content: Buffer.from(content).toString('base64'), sha: fileData.sha })
      });
      message.reply('✅ Website Mainframe Updated.');
    } catch (e) { message.reply('❌ Push Failed.'); }
  }
});

client.login(process.env.DISCORD_TOKEN);
