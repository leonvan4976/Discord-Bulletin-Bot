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
        new SlashCommandBuilder().setName('register').setDescription('Add yourself to the bot\'s database.'),
        new SlashCommandBuilder().setName('unregister').setDescription('Remove yourself from the bot\'s database.'),
        new SlashCommandBuilder().setName('profile').setDescription('Replies with user profile.'),
        new SlashCommandBuilder().setName('unsubscribe').setDescription('Unsubscribe from a tag.'),
        new SlashCommandBuilder().setName('subscribe').setDescription('Subscribe to a tag you are interested in.'),
        new SlashCommandBuilder().setName('post').setDescription('Post a message with associated tags.')
        .addStringOption(option => option.setName('message')
            .setDescription('Write a message to be delivered to subscribers.')
            .setRequired(true)),
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
