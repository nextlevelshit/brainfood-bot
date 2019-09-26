# Telegram WG-Gesucht.de Bot

This telegram bot scrapes the most recent offers from wg-gesucht.de and sends them via telegram to the client.

## Install

```shell
git clone https://github.com/nextlevelshit/wggesucht-bot.git

# or

git clone git@github.com:nextlevelshit/wggesucht-bot.git
```

## Usage

### 1. Install dependencies

```shell
npm install

# or

yarn
```

### 2. Generate configuration

This script will generate a `config.json` and `scrapoxy.json` file to your root directory.

```shell
npm run init
```

### 3. Configuration

```json
// in config.json
{
  "telegram": {
    "token": ""
  },
  "interval": 1000,
  "source": "",
  "host": "",
  "opts": {
    "proxy": "",
    "tunnel": false
  }
}
```

```json
// in scrapoxy.json
{
  "commander": {
    "password": "YOUR_PASSWORD"
  },
  "instance": {
    "port": 3128,
    "scaling": {
      "min": 1,
      "max": 2
    }
  },
  "providers": [{
    "type": "digitalocean",
    "token": "",
    "region": "",
    "size": "",
    "sshKeyName": "",
    "imageName": "",
    "tags": ""
  }]
}
```

```json5
// in bot.json5
{
  apps : [
    {
      name         : "scrapoxy",
      script       : "scrapoxy",
      args         : ["start", "scrapoxy.json", "-d"],
      kill_timeout : 30000,
    },
    {
      name         : "bot",
      script       : "node",
      args         : ["index.js"],
      kill_timeout : 30000,
    },
  ],
}
```

### 4. Set up your provider

...

### 5. Start the engine

```shell
npm run start
```
