// External libraries
const url = require('url')
const https = require('https')
const request = require('request')
const HttpsProxyAgent = require('https-proxy-agent')
// Local libraries and configurations
const config = require('./config')

let options = url.parse(config.url)
let agent = new HttpsProxyAgent(config.proxy)
options.agent = agent

request(
  {
    'url': config.url,
    'proxy': config.proxy
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      console.log(body)
    } else {
      console.log(error, response)
    }
  })
// https.get(options, (res) => {
//   let data = ''

//   res.on('data', (chunk) => { data += chunk })
//   res.on('end', () => { 
//     console.log(data)
//   })

// }).on('error', (err) => {
//   console.error(`Error: ${err.message}`)
// })
  // console.log('"response" event!', res.headers);
  // res.pipe(process.stdout);
