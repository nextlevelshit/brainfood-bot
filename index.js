// External libraries
const Telegraf = require('telegraf')
const _ = require('lodash')
const https = require('https')
const cheerio = require('cheerio')
// Local libraries and configurations
const config = require('./config')
const bot = new Telegraf(config.telegram.token)

let entries = []
let connection = null
let httpResponse = null

bot.start((ctx) => {
  setConnection(ctx)
  startCrawler()
  sendWelcome()
})

bot.startPolling()

function startCrawler() {
  console.log('[new user connected]')
  console.log(connection.update.message.from)

  crawl(config.url)

  setTimeout(crawl, config.interval, config.url)
}

function sendWelcome() {
  connection.replyWithMarkdown(`
*Soeben hast du den WG-Gesucht Bot gestartet.*
Sobald neue Inserate verfügbar sind, sende ich dir eine Nachricht. Viel Glück bei der Suche!
  `)
}

function crawl(url) {
  https.get(url, (res) => {
    let data = ''

    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => { checkNewEntries(data) });

  }).on('error', (err) => {
    console.error(`Error:${err.message}`)
  });
}

function checkNewEntries(data) {
  let newEntries = _.difference(parseEntries(data), entries)

  if (!newEntries) {
    console.warn('[no new entries]')
    return
  }

  newEntries.forEach(item => {
    sendNewEntry(item)
  })

  entries = _.uniqBy([...newEntries, ...entries], 'url')
}

function parseEntries(content) {
  const $ = cheerio.load(content);
  let entries = [];

  $('[id^=liste-details-ad]').not('.display-none').each(function(i, item) {
    let result = {
      url: config.urlPrefix + $(item).find('a.detailansicht').attr('href')
    }
    entries.push(result)
  });

  return entries
}

/**
 * Sending new Entry to all followers
 * 
 * @param entry: {
 *  price: number
 *  disctrict: string
 *  url: string
 * }
 */

function sendNewEntry(entry) {
  connection.reply(entry.url);
}

function httpRequest() {
  return 
}

function setConnection(ctx) {
  connection = ctx
}

