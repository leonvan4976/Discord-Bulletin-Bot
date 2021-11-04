const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
// Remember to update the guildID in .env to reflect the server the bot is being used in.

/*
    Eventually we will want to declare global commands for the bot instead of registering them with a given server.
    This isn't as useful for testing global commands take a long time to update.
    Global commands can be registered by changing the route for the commands below.
*/


const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new SlashCommandBuilder().setName('yo').setDescription('A hello message.'),
    new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
    new SlashCommandBuilder().setName('profile').setDescription('Replies with user profile'),
]
    .map(command => command.toJSON());

const token = process.env.DISCORDJS_BOT_TOKEN;
const clientID = process.env.clientID;

//console.log(`${clientID}`);

const rest = new REST({ version: '9' }).setToken(token);

// Need to change the route to be for global commands
rest.put(Routes.applicationGuildCommands(process.env.clientID, process.env.guildID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
