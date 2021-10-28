const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
// Remember to update the guildID in .env to reflect the server the bot is being used in.

/*
    I (Gavin) changed the .env file to include the clientID and the guildID.
    So if you are having issues with running my code,
    be sure that your .env file has clientID and guildID set to the values for your bot and server, respectively.
*/

function register_commands(){
    
    // List of commands to register and their descriptions.
    const commands = [
        new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
        new SlashCommandBuilder().setName('yo').setDescription('A hello message.'),
        new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
        new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
        new SlashCommandBuilder().setName('profile').setDescription('Replies with user profile.'),
        new SlashCommandBuilder().setName('private').setDescription('Replies with a message only visible to the one who used the command.'),
    ]
        .map(command => command.toJSON());

    const token = process.env.DISCORDJS_BOT_TOKEN;
    const clientID = process.env.clientID;

    const rest = new REST({ version: '9' }).setToken(token);

    rest.put(Routes.applicationGuildCommands(process.env.clientID, process.env.guildID), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}

module.exports = { register_commands }
