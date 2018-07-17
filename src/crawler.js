
const _ = require('lodash')
const Promise = require('bluebird')
const cheerio = require('cheerio')
const request = require('request')

/**
 * Get all the urls of the links
 * @param url Main URL
 * @param host Main Host of URL
 * @param optsDefault Proxy Options
 * @returns {promise}
 */
function crawler(url, host, optsDefault) {

  return new Promise((resolve, reject) => {
    // Create options for the HTTP request
    // Add the URL to the default options
    const opts = _.merge({}, optsDefault, { url })

    request(opts, (err, res, body) => {
      // Error Handling
      if (err) return reject(err)
      if (res.statusCode !== 200) return reject(body)
      // Load content into a JQuery parser
      const $ = cheerio.load(body)
      // Extract all urls
      const urls = $('[id^=liste-details-ad]').not('.display-none')
        .map((i, el) => $(el).find('a.detailansicht').attr('href'))
        .get()
        .map(url => `${host}${url}`)

      resolve(urls)
    })
  })
}

module.exports = crawler
