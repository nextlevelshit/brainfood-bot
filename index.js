// External libraries should be loaded at the beginning
const TelegramBot = require('node-telegram-bot-api');
// Local libraries and configurating local constants
const config = require('./config');
// Configurating our main piece of code
const bot = new TelegramBot(config.token, {polling: true});

bot.on('text', (msg) => {
  if (msg.entities[0].type === 'url') {
    console.log(`[${msg.chat.title}] ${msg.text}`);
    bot.sendMessage(msg.chat.id, `Found link: ${msg.text}`);
  }
});