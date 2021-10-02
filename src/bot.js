//Importing libraries
require('dotenv').config();
const { Client, Intents} = require('discord.js');

/*
  Code to login the bot onto the servers.
*/
const client_obj = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]}); //Creating a client_object to use Client functions
//console.log(process.env.DISCORDJS_BOT_TOKEN); //debug print statement,
client_obj.login(process.env.DISCORDJS_BOT_TOKEN); //This code logs in our bot.
