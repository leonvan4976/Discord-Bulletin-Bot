/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton, User } = require('discord.js');
/*

*/
const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');

// Add the user to the database.
async function command_register(interaction){
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    let response =`Hello ${userTag}, seems like something went wrong, try again!`;

    const userRegistered = await isUserRegistered(userIdVar);
    if ( !userRegistered ) {
        response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`;
        Users.create({userId: userIdVar, userName: userTag});
        interaction.reply({content: response, ephemeral: true});
        return;
    } else {
        response = `Hello ${userTag}, your profile already exists!`;
        interaction.reply({content: response, ephemeral: true});
        return;
    } 
}

// Remove the user from the database.
async function command_unregister(interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;

    
    const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('unregister')
                    .setLabel('unregister')
                    .setStyle('DANGER'),
    );

    let response = `Hello ${userTag}, are you sure you wish to delete your profile?`;
    interaction.reply({ content: response, ephemeral: true, components: [row] });
    const wait = require('util').promisify(setTimeout);


}
async function button_unregister(interaction) {
    await interaction.deferUpdate()
        .catch(console.error);
    await interaction.editReply({ content: 'Your Request is being processed.', components: [] });
    const index = await Users.destroy({
        where: {
            userId: interaction.user.id
        }
    });
    console.log(index);
    if (index == 0) {
        reply = "You are not a registered user."
    } else {
        reply = "Your profile has been cleared."
    };
    await interaction.followUp({ content: reply, ephemeral: true, components: [] });
}

// Responds with user profile.
function command_profile(client_obj, interaction){
    displayMenu(client_obj,interaction, 'Here\'s a list of what you subscibed.',['1','2','3']);
}

async function command_subscribe(client_obj, interaction) {
    const getAllTagsFromDB = ['1','2','3','4','5'];
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    const userRegistered = await isUserRegistered(userIdVar);
    if ( !userRegistered ) {
        const response = `Hello ${userTag}, you have not registered yet. Use /register to register`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    // *************this block is for dev use only, remove later *********************
    //create fake demo tags if you database havent been set up
    let demoTagsArr = ['cse101','cse130','cse140'];
    // Check if there are already tags in the database
    Tags.findAndCountAll()
    .then((result)=> {
        if(result.count === 0){
            // console.log(result);
            for(const [i, name] of demoTagsArr.entries()){
                // Temporarily add tags to database
                Tags.create({id: i, tagName: name});
                // console.log('Tag created!')
            }
        }
    })
    .catch(console.error);
    // ****************************
    
    const tags = await Tags.findAll();
    // console.log(tags);
    // response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`;
    // interaction.reply({content: response, ephemeral: true});
    displayMenu(client_obj, interaction, "Select tags that you want to subscribe!", tags);
    let componentId = `select${interaction.id}`;
    client_obj.on('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you selected tagID: '+ ddinteraction.values, embeds: [], components: []})
            .then((message) => ddinteraction.values)
            .catch(console.error);
            if(ddinteraction.values){
                //ddintereation.values == arr of tagID the user selected
                console.log('add id: '+userIdVar );
                ddinteraction.values.map(id=>Subscriptions.create({userId: userIdVar+'fsf', tagId: id})
                    .catch(err=>console.log('invalid user id or tag id')));
                // Subscriptions.create({userId: userIdVar, tagId: 8});
            }
        }
    })
}

function command_unsubscribe(client_obj, interaction) {
    const getSubTagsFromDB = ['1','2','3'];
    displayMenu(client_obj, interaction, "Select tags you want to unsubscribe!", getSubTagsFromDB);
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;
    client_obj.on('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you selected '+ ddinteraction.values, embeds: [], components: []})
            .then((message) => ddinteraction.values)
            .catch(console.error);


            if(ddinteraction.values){
                //ddintereaction.values is the array of selected tags
            }
        }
    })
    
}

// ************************************************************************

// helper functions

function displayMenu(client_obj, interaction, description, arrayToDisplay) {
    const tagEmbed = new MessageEmbed()
    .setColor('#0099ff') 
    .setTitle('Tags')
    .setAuthor(interaction.user.tag + "'s User Profile")
    .setDescription(description)
    .setTimestamp();

    
    //TODO: will import a list of tagas from database
    //just a demo tags list for now
    // let demoTagsArr = ['cse101','cse130','cse140'];
    //tagsTOJSON() returns a list of options objects, we can just .addOptions(tagsToJSON())later
    function arrayToJSON() {
        let optionsJSONArray = []
        arrayToDisplay.map((eachTag)=> {
            optionsJSONArray.push({label: eachTag.tagName.toString(), value: eachTag.id.toString()})
        })
        return optionsJSONArray;
    }
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;

    //Create a tag dropdown menu
    function createDropDown(placeholder,tagsJSON){
        return new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(componentId)
                .setPlaceholder(placeholder)
                .setMinValues(1)
                .setMaxValues(arrayToDisplay.length)
                .addOptions(tagsJSON)
        )
    }

    //Have the bot send a channel message with the user profile and select menu
    // Made this reply ephemeral to not spam the chat
    interaction.reply({embeds: [tagEmbed], components: [createDropDown('Please select a tag',arrayToJSON())], ephemeral: true})
        .then(() => console.log(`Replied to message "${interaction.commandName}"`))
        .catch(console.error);

    const wait = require('util').promisify(setTimeout);
}

async function isUserRegistered(userId) {
    const user = await Users.findAll({
        where: {
            userId: userId
            }
        })
        .catch(false);
    // return false if user[] is empty, otherwise, this user is registered
    console.log(user);
    return user.length!==0;
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = { command_register, command_unregister, button_unregister, command_profile, command_subscribe, command_unsubscribe }
