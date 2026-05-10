const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const express = require('express');

const app = express();
const parser = new Parser();

// 1. THE HEARTBEAT (Fixed for UptimeRobot)
app.get('/', (req, res) => {
    res.status(200).send('LexOS 3.1: Heartbeat Optimal.');
});
const server = app.listen(process.env.PORT || 10000, () => {
    console.log(`[NETWORK]: Web Server Active on Port ${process.env.PORT || 10000}`);
});

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

// 2. THE RECONNECTION LOGIC
client.on('ready', () => {
  console.log(`[SYSTEM]: LexOS Online. Sentinel Heartbeat Synchronized.`);
  setInterval(trackTikTok, 20 * 60 * 1000); // Scan every 20 mins
});

async function trackTikTok() {
    if (!tiktokHandle) return;
    try {
        // Using a more stable bridge for 2026
        const feed = await parser.parseURL(`https://tok.artemislena.eu.org/${tiktokHandle}/rss`);
        const latestVideo = feed.items[0];
        
        if (latestVideo && latestVideo.id !== lastVideoID) {
            lastVideoID = latestVideo.id;
            const channel = client.channels.cache.get(CHANNELS.TIKTOK_FEED);
            const embed = new EmbedBuilder()
                .setColor('#ff1a1a')
                .setTitle('🚀 NEW CONTENT: BOSS BABES HQ')
                .setURL(latestVideo.link)
                .setDescription(`@everyone **The Commander just posted!** \n\nGet in there and flood the comments for the algorithm! \n\n[WATCH NOW](${latestVideo.link})`)
                .setFooter({ text: 'LexOS Sentinel | Powered by Roberts Ent.' });

            if (channel) channel.send({ content: '@everyone', embeds: [embed] });
        }
    } catch (e) {
        console.log("[SENTINEL]: Polling TikTok... (No new content or temporary timeout)");
    }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const command = message.content.split(' ')[0].toLowerCase();
  const args = message.content.split(' ').slice(1);

  // --- COMMANDS ---
  if (command === '!set-tiktok' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    tiktokHandle = args[0]?.replace('@', '');
    message.reply(`✅ **Sentinel Locked:** Tracking @${tiktokHandle}. First scan initiating...`);
    trackTikTok();
  }

  if (command === '!ask' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    try {
      const result = await model.generateContent(`You are LexOS, the elite AI Chief of Staff for Commander Lexieee and Boss Babes HQ. ${args.join(' ')}`);
      message.reply(result.response.text());
    } catch (e) { message.reply('❌ Neural link timed out. Try again.'); }
  }

  if (command === '!squad-up') {
    const target = client.channels.cache.get(CHANNELS.SQUAD_RALLY);
    if (target) target.send('🚨 **WAR ROOM ALERT:** @everyone Lexie is dropping in. Fill the lobby now. Join Voice.');
  }

  if (command === '!meta') {
    const target = client.channels.cache.get(CHANNELS.WARZONE);
    const embed = new EmbedBuilder().setColor('#00f2ea').setTitle('🔫 CURRENT ELITE META').addFields({ name: '🔥 BO7 / Warzone', value: 'XM4 Build | C9 Speed Build' });
    if (target) target.send({ embeds: [embed] });
  }
  
  if (command === '!update-timer' && message.channel.id === CHANNELS.WEB_OPS) {
    const newDate = args.join(' ');
    message.reply('⏳ Rewriting Website Mainframe...');
    // GitHub Logic stays same...
  }
});

// Automatic login and error handling
client.login(process.env.DISCORD_TOKEN).catch(err => console.error("[AUTH ERROR]: Token rejected."));
