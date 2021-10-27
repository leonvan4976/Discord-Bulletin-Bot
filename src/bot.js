/*
  Importing Libraries
    dotenv:       a required library to actually boot up the bot
    examplelib:   a local library containing some example discordapi functions
*/
require('dotenv').config();
const examplelib = require("./exampleevents.js");
const corelib = require("./core.js");
const { Sequelize } = require('sequelize');

/* // connect to database */
const sequelize = new Sequelize('test_db', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}


/*
  Code to login the bot onto the servers.
    client_obj:   a object of the Client class, the main hub for interacting with
                  the discord API. https://discord.js.org/#/docs/main/stable/class/Client
    
*/
const { Client, Intents } = require('discord.js');
const client_obj = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//Example function calls
examplelib.bot_login_debug(client_obj);
examplelib.bot_message_debug(client_obj);

//Testing a command_scan function
corelib.command_scan(client_obj,'!');


//This code logs in our bot.
client_obj.login(process.env.DISCORDJS_BOT_TOKEN);
