const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Parser = require('rss-parser');
const express = require('express');

const app = express();
const parser = new Parser();
app.get('/', (req, res) => res.send('LexOS 3.1 Sentinel: Active.'));
app.listen(process.env.PORT || 3000);

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

// SENTINEL DATA STORAGE
let lastVideoID = '';
let tiktokHandle = ''; // Set this using !set-tiktok
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'rayray8606'; 
const REPO_NAME = 'boss-babes-hq';

client.on('ready', () => {
  console.log(`[SYSTEM]: LexOS Sentinel Online. Tracking: ${tiktokHandle || 'None'}`);
  
  // START THE 30-MINUTE AUTO-POLLER
  setInterval(trackTikTok, 30 * 60 * 1000); 
});

async function trackTikTok() {
    if (!tiktokHandle) return;
    try {
        // Using a high-performance 2026 RSS bridge for TikTok
        const feed = await parser.parseURL(`https://rss.app/feeds/v1.1/t/${tiktokHandle}`);
        const latestVideo = feed.items[0];
        
        if (latestVideo && latestVideo.id !== lastVideoID) {
            lastVideoID = latestVideo.id;
            const channel = client.channels.cache.get(CHANNELS.TIKTOK_FEED);
            
            const embed = new EmbedBuilder()
                .setColor('#00f2ea')
                .setTitle('🚀 AUTOMATIC CONTENT DETECTED')
                .setURL(latestVideo.link)
                .setDescription(`@everyone **The Commander just posted!** \n\nWe need maximum engagement in the next 60 seconds to hit the FYP! \n\n[WATCH & LIKE NOW](${latestVideo.link})`)
                .setThumbnail('https://i.imgur.com/vHq7j0U.png')
                .setFooter({ text: 'Sentinel Mode: Active' });

            channel.send({ content: '@everyone', embeds: [embed] });
            console.log(`[SENTINEL]: New Video Detected and Broadcasted: ${latestVideo.id}`);
        }
    } catch (e) {
        console.error("[SENTINEL ERROR]: Feed unreachable or restricted.");
    }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // --- SET TIKTOK TARGET ---
  if (command === '!set-tiktok' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    tiktokHandle = args[1].replace('@', '');
    message.reply(`✅ **Sentinel Target Locked:** Now tracking @${tiktokHandle}. I will scan every 30 minutes.`);
    trackTikTok(); // Run an immediate scan
  }

  // --- AI BRAIN (!ask) ---
  if (command === '!ask' && message.channel.id === CHANNELS.LEXOS_BRAIN) {
    try {
      const result = await model.generateContent(`You are LexOS. ${args.slice(1).join(' ')}`);
      message.reply(result.response.text());
    } catch (e) { message.reply('❌ Neural Error.'); }
  }

  // --- MANUAL BROADCASTS ---
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
});

client.login(process.env.DISCORD_TOKEN);
