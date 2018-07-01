// External libraries
const Telegraf = require('telegraf')
const _ = require('lodash')
const https = require('https')
const cheerio = require('cheerio')
const url = require('url')
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

bot.command('refresh', (ctx) => {
  setConnection(ctx)

  console.log(`[refreshing entry list]: ${connection.update.message.from.first_name}`)

  crawl(config.url)
})

bot.startPolling()

function startCrawler() {
  console.log(`[new connection]: ${connection.update.message.from.first_name}`)

  crawl(config.url)

  setInterval(() => {
    crawl(config.url)
  }, config.interval)
}

function sendWelcome() {
  connection.replyWithMarkdown(`
*Soeben hast du den WG-Gesucht Bot gestartet.*
Sobald neue Inserate verfügbar sind, sende ich dir eine Nachricht. Viel Glück bei der Suche!
  `)
}

function crawl(url) {
  console.log('[starting crawler]')

  https.get(url, (res) => {
    let data = ''

    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => { checkNewEntries(data) })

  }).on('error', (err) => {
    console.error(`Error:${err.message}`)
  });
}

function checkNewEntries(data) {
  let results = _.differenceWith(parseEntries(data), entries, _.isEqual)

  console.log('[new results]')
  console.log(results)

  results.forEach(item => {
    sendNewEntry(item)
  })

  entries = [...results, ...entries]

  console.log(`[current entry list]: ${connection.update.message.from.first_name}`)
  console.log(entries)
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

