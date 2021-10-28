/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

// Simple test command.
function command_ping(interaction){
    interaction.reply('Pong!');
}

// Another simple test command.
function command_yo(interaction){
    interaction.reply('what\'s up');
}

// Example function for getting info from the interaction.
// Displays the name, id, and member count of the current server.
function command_server(interaction){
    interaction.reply(`Server name: ${interaction.guild.name}\nServer ID: ${interaction.guild.id}\nTotal members: ${interaction.guild.memberCount}\n`);
}

// Example function for getting info from the interaction.
// Displays user's tag and id.
function command_user(interaction){
    interaction.reply(`User name: ${interaction.user.tag}\nUser ID: ${interaction.user.id}\n`);
}

// A test of the ephemeral command feature.
// Response is only visible to the user who used the command.
function command_private(interaction){
    interaction.reply({ content: 'Only you can see this message.', ephemeral: true});
}

// Responds with user profile.
// This is where the updated drop down list code can be added.
function command_profile(interaction){
    const tagEmbed = new MessageEmbed()
    .setColor('#0099ff') 
    .setTitle('Tags')
    .setAuthor(interaction.user.tag + "'s User Profile")
    .setDescription('Some description here')
    .setTimestamp();

    //Create a tag option select menu
    const Row1 = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions([
            {
                label: 'Art',
                emoji: '🎨',
                value: 'first_option',
            },
            {
                label: 'CS',
                emoji: '💻',
                value: 'second_option',
            },
        ]),
    );

    //Have the bot send a channel message with the user profile and select menu
    interaction.reply({embeds: [tagEmbed], components: [Row1]})
    .then(() => console.log(`Replied to message "${interaction.commandName}"`))
    .catch(console.error);
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = { command_ping, command_yo, command_server, command_user, command_private, command_profile }
