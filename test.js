const _ = require('lodash')
const Promise = require('bluebird')
const winston = require('winston')

const crawler = require('./src/crawler')
const config = require('./config')

crawler(config.source, config.host, config.opts).then(urls => {
  winston.info('Found %d links', urls.length)

  return Promise.map(
    urls,
    url => {
      winston.info(url)
    },
    { concurrency: 1 }
  ).then(links => {
    const results = _.compact(links)

    winston.info('Extracted %d links', urls.length)
  })
}).catch(err => winston.error('Error: ', err))
