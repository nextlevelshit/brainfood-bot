// External libraries should be loaded at the beginning
const TelegramBot = require('node-telegram-bot-api');
// Local libraries and configurating local constants
const config = require('./config');
const token = config.token;
// Configurating our main piece of code
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  var hi = 'hi';
  if (msg.text.toLowerCase().indexOf(hi) === 0) {
    bot.sendMessage(msg.chat.id,'Hello dear user');
  } 
      
  let bye = 'bye';
  if (msg.text.toLowerCase().includes(bye)) {
    bot.sendMessage(msg.chat.id, 'Hope to see you around again , Bye');
  } 
});