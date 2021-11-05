/*
  Importing Libraries
    dotenv:             a required library to actually boot up the bot.
    deploy_commands:    a local library that registers the bots commands to a given server.
    event_handler:      a local library that contains the functions the bot uses to respond to commands.
*/
require('dotenv').config();
const examplelib = require("./exampleevents.js");
const corelib = require("./core.js");
const { Sequelize } = require('sequelize');
const deploy_commands = require("./deploy-commands.js");
const event_handler = require("./event-handler.js");


/*
  Code to login the bot onto the servers.
    client_obj:   a object of the Client class, the main hub for interacting with
                  the discord API. https://discord.js.org/#/docs/main/stable/class/Client 
*/
const { Client, Intents } = require('discord.js');
const client_obj = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Register the bot's commands. Does this every time the bot starts which is a little overkill.
// Only registers for a given server, as opposed to being global.
// Likely won't be needed in the end, if we eventually declare global commands.
// This code is in deploy-commands.js
deploy_commands.register_commands();

// In response to a slash command.
client_obj.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()){ 
        return;
    }

    const { commandName } = interaction;
    
    // The code for each event is in event-handler.js.
    if (commandName === 'register') {
        await event_handler.command_register(interaction);
    } 
    else if (commandName === 'unregister'){
        await event_handler.command_unregister(interaction);
    }
    else if (commandName === 'profile') {
        await event_handler.command_profile(client_obj,interaction);
    }
});

//This code logs in our bot.
client_obj.login(process.env.DISCORDJS_BOT_TOKEN);

client_obj.on('ready', () => {
    console.log(`${client_obj.user.tag} has logged in`);
});