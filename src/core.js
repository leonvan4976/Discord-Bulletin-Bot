/*
    core.js holds the major functions required needed for the core functionality of the bot.
*/

// Imports classes from Discord.js
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');


//A generic function used to scan the contents of a message for commands
function command_scan(client_obj, delimiter_open, delimiter_close) {

    //Error checking and setting default values.
    if (typeof delimiter_open == "undefined") {
        throw TypeError("Atleast one delimiter needs to be passed.");
    }
    if (typeof delimiter_close == "undefined") {
        delimiter_close = '';
    }

    //Creating a custom regex expression based on the function's input parameters.
    let reg_ex = new RegExp(delimiter_open + '[a-zA-Z0-9]+' + delimiter_close, 'g');
    //console.log(delimiter_open + '[a-zA-Z0-9]+' + delimiter_close);   //Debug       

    client_obj.on('messageCreate', async (message, interaction) => {
        let command_list = (String(message.content)).match(reg_ex);
        if(command_list == null){
            //If no commands are found, return null
            return null;
        }else{
            //author is the identification of the discord user who sent the message
            let author = message.author;
            //Code to send a response to the user who used a command
            author.send("The commands you have sent to the bot is: " + command_list.toString());
            //Code to react to the user who used a command
            message.react('👌');

            //Create an embed that displays the message sender's user profile
            const tagEmbed = new MessageEmbed()
            .setColor('#0099ff') 
            .setTitle('Tags')
            .setAuthor(author.username + "'s User Profile")
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
            await message.channel.send({embeds: [tagEmbed], components: [Row1]})
            .then(() => console.log(`Replied to message "${message.content}"`))
            .catch(console.error);

            return { 'author' : author , 'command_list' : command_list};
        }
    });
}


module.exports = {command_scan}