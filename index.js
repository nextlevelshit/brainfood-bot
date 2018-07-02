// External libraries
const Telegraf = require('telegraf')
const _ = require('lodash')
const https = require('https')
const cheerio = require('cheerio')
const url = require('url')
// Local libraries and configurations
const config = require('./config')
const bot = new Telegraf(config.telegram.token)

let connection
let httpResponse
let sessions = []

bot.start((ctx) => {
  let id = ctx.update.message.from.id

  setConnection(ctx, id)
  setUrl(config.url, id)
  startCrawler(id)
  sendWelcome(id)
})

bot.on('text', (ctx) => {
  let id = ctx.update.message.from.id
  let url = ctx.message.text

  if (!sessions[id]) {
    ctx.replyWithMarkdown(`**Du hast deinen Bot noch nicht aktiviert**\n\rBitte starte ihn zunächst indem du **/start** an ihn sendest.`)
    return
  }

  if (url.indexOf(config.urlPrefix) !== 0) {
    ctx.replyWithMarkdown(`**Keine gültige Adresse**\n\rDie Seite mit den Suchergebnissen muss mit \`${config.urlPrefix}\` beginnen. Bitte versuche es nochmal.`)
    return
  }

  setUrl(url, id)
  crawl(id, checkNewEntries)

  console.log(`[${id}] Url Changed: ${ctx.message.text}`)
})

bot.startPolling()

function startCrawler(id) {
  console.log(`[${id}] Connected`)

  crawl(id, checkNewEntries)

  setInterval(() => {
    crawl(id, checkNewEntries)
  }, config.interval)
}

function setUrl(url, id) {
  sessions[id].url = url
}

function sendWelcome(id) {
  sessions[id].ctx.replyWithMarkdown(`*Soeben hast du den WG-Gesucht Bot gestartet.*\n\rSobald neue Inserate verfügbar sind, sende ich dir eine Nachricht. Viel Glück bei der Suche!`)
}

function crawl(id, callback) {
  console.log(`[${id}] Starting`)

  https.get(sessions[id].url, (res) => {
    let data = ''

    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => { callback(data, id) })

  }).on('error', (err) => {
    console.error(`Error: ${err.message}`)
  });
}

function checkNewEntries(data, id) {
  let resultList = _.differenceWith(parseEntries(data), sessions[id].entries, _.isEqual)

  if (resultList.length > 0) {
    console.log(`[${id}] New Result List`)
    console.log(resultList)
  }

  resultList.forEach(item => {
    sendNewEntry(item, id)
  })

  sessions[id].entries = [...resultList, ...sessions[id].entries]
}

function parseEntries(content) {
  const $ = cheerio.load(content);
  let resultList = [];

  $('[id^=liste-details-ad]').not('.display-none').each(function(i, item) {
    let result = {
      url: config.urlPrefix + $(item).find('a.detailansicht').attr('href')
    }
    resultList.push(result)
  });

  return resultList
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

function sendNewEntry(entry, id) {
  sessions[id].ctx.reply(entry.url);
}

function setConnection(ctx, id) {
  sessions[id] = {
    ctx: ctx,
    url: null,
    entries: []
  }
}

