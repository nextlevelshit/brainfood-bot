// External libraries
const Telegraf = require('telegraf')
const _ = require('lodash')
const request = require('request')
const https = require('https')
const winston = require('winston')
const cheerio = require('cheerio')
const Promise = require('bluebird')
// Local libraries and configurations
const config = require('./config')
const crawler = require('./src/crawler')
const bot = new Telegraf(config.telegram.token) 

let connection
let httpResponse
let sessions = []

bot.start((ctx) => {
  let id = ctx.update.message.from.id

  setConnection(ctx, id)
  setUrl(config.source, id)
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

  if (url.indexOf(config.host) !== 0) {
    ctx.replyWithMarkdown(`**Keine gültige Adresse**\n\rDie Seite mit den Suchergebnissen muss mit \`${config.host}\` beginnen. Bitte versuche es nochmal.`)
    return
  }

  setUrl(url, id)
  crawl(id, checkNewEntries)

  winston.info(`[${id}] Url Changed: ${ctx.message.text}`)
})

bot.startPolling()

// HELPER FUNCTIONS

function startCrawler(id) {
  winston.info(`[${id}] Connected`)

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
  winston.info(`[${id}] Starting`)

  crawler(sessions[id].url, config.host, config.opts)
    .then(urls => {
      callback(urls, id)
    }).catch(err => winston.error('Error: ', err))
}

function checkNewEntries(urls, id) {
  winston.info(`[${id}] Found %d links`, urls.length)

  let resultList = _.differenceWith(urls, sessions[id].entries, _.isEqual)

  resultList.forEach(item => {
    sendNewEntry(item, id)
  })

  sessions[id].entries = [...resultList, ...sessions[id].entries]
}

function sendNewEntry(entry, id) {
  sessions[id].ctx.reply(entry);
}

function setConnection(ctx, id) {
  sessions[id] = {
    ctx: ctx,
    url: null,
    entries: []
  }
}

