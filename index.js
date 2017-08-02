// External libraries should be loaded at the beginning
const TelegramBot = require('node-telegram-bot-api');
const Twit = require('twit');
// Local libraries and configurating local constants
const config = require('./config');
// Configurating our main piece of code
const bot = new TelegramBot(config.telegram.token, {polling: true});
const T = new Twit(config.twitter);

bot.on('text', (msg) => {
  if (msg.entities) {
    if (msg.entities[0].type === 'url') {
      let status = `[${msg.chat.title}] ${msg.text}`;

      T.post('statuses/update', { status: status }, (error, data, response) => {
        if (error) {
          console.error(error); return;
        }
        console.log(status, data);
      });
    }
  }
});