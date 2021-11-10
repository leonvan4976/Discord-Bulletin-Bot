/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed, User, MessageButton } = require('discord.js');
/*

*/
const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');
const { Op } = require("sequelize");

// Add the user to the database.
function command_register(interaction){
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    let response =`Hello ${userTag}, you have already registered!`;
    
    // code for adding user to the database.
    Users.create({userId: userIdVar, userName: userTag});
    response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`;
    interaction.reply({content: response, ephemeral: true});

    /*
    const promise = new Promise((resolve, reject) =>{ 
        let userTemp = Users.findByPk(userID);
        if(userTemp === null){
            Users.create({userId: userID, userName: userTag});
            resolve(`Hello ${userTag}, your profile has been created successfully.\nYou can use the profile command to add/remove tags.`);
        } else{
            resolve(`Hello ${userTag}, your profile has been already registered!`);
        }
    });
    //
    promise.then((message) => {
        interaction.reply({content: message, ephemeral: true});
    }).catch((message) => {
        console.log(message);
    });
    */
    /*
    const [user , created] = Users.findOrCreate({
        where: {userId: userIdVar},
        defaults:{
            userId: userIdVar,
        }
    });
    */
}

function command_unregister(client_obj, interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;
    const customId = 'unregister'+interaction.id;
    const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(customId)
                    .setLabel('unregister')
                    .setStyle('DANGER'),
    );
    //TODO: Check if user is registered
    let response = `Hello ${userTag}, are you sure you wish to delete your profile?`;
    interaction.reply({ content: response, ephemeral: true, components: [row] });

    const wait = require('util').promisify(setTimeout);

    //binteraction= button interaction
    client_obj.on('interactionCreate', async binteraction => {
        if (!binteraction.isButton()) return;
        console.log(binteraction+'bin');
        console.log(interaction.id+'inte');
        if(binteraction.customId===customId) {
            await binteraction.deferUpdate()
                .catch(console.error);
            await binteraction.editReply({ content: 'Your Request is being processed.', components: [] });
            index = await Users.destroy({
                where: {
                    userId: interaction.user.id
                }
            });
            console.log(index);
            if (index == 0) {
                reply1 = "You are not a registered user."
            } else {
                reply1 = "Your profile has been cleared."
            };
            await interaction.followUp({ content: reply1, ephemeral: true, components: [] });
        }
        return;
    });
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
    const unsubscribeTags = await getUnsubscribedTags(userIdVar);
    if (unsubscribeTags.length===0) {
        const response = `Hello ${userTag}, there is no new tag at this moment:).`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    displayMenu(client_obj, interaction, "Select tags that you want to subscribe!", unsubscribeTags);
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
                ddinteraction.values.map(id=>Subscriptions.create({userId: userIdVar, tagId: id})
                    .catch(err=>console.log('invalid user id or tag id')));
            }
        }
    })
}

async function command_unsubscribe(client_obj, interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    const userRegistered = await isUserRegistered(userIdVar);
    if ( !userRegistered ) {
        const response = `Hello ${userTag}, you have not registered yet. Use /register to register`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    const subscibedtags = await getSubscribedTags(userIdVar);
    if (subscibedtags.length===0) {
        const response = `Hello ${userTag}, you have not subscribe to any tag yet. Use /subscribe to subscribe`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    displayMenu(client_obj, interaction, "Select tags you want to unsubscribe!", subscibedtags);
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
            await ddinteraction.editReply({content: 'you selected tagID: '+ ddinteraction.values, embeds: [], components: []})
            .then((message) => ddinteraction.values)
            .catch(console.error);
            if(ddinteraction.values){
                //ddintereation.values == arr of tagID the user selected
                console.log('add id: '+userIdVar );
                ddinteraction.values.map(id=>{
                    Subscriptions.findOne({
                        where: {userId: userIdVar, tagId: id}
                    })
                    .then(sub=> sub.destroy())
                    .catch('User tag: '+userTag+' failed to unsubscribe tag id: '+id)
                })
            }
        }
    })
    
}

function command_post(client_obj, interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;
    let message = interaction.options.getString('message');

    let response = `Hello ${userTag}, you are posting the message: ${message}`;


    //TODO: will import a list of tagas from database
    //just a demo tags list for now
    let demoTagsArr = ['cse101','cse130','cse140'];
    // Check if there are already tags in the database
    Tags.findAndCountAll()
    .then((result)=> {
        if(result.count === 0){
            console.log(result);
            for(const [i, name] of demoTagsArr.entries()){
                // Temporarily add tags to database
                Tags.create({id: i, tagName: name});
                console.log('Tag created!')
            }
        }
    })
    .catch(console.error);
    // Later you would just retrieve tags from database
    //

    //tagsTOJSON() returns a list of options objects, we can just .addOptions(tagsToJSON())later
    function tagsToJSON() {
        let optionsJSONArray = []
        demoTagsArr.map((eachTag)=> {
            optionsJSONArray.push({label: eachTag, value: eachTag})
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
                .setMaxValues(demoTagsArr.length)
                .addOptions(tagsJSON)
        )
    }

    //Have the bot send a channel message with the user profile and select menu
    interaction.reply({content: response, components: [createDropDown('Please select a tag',tagsToJSON())], ephemeral: true})
        .then(() =>{
            console.log(`Replied to message "${interaction.commandName}"`)
        })
        .catch(console.error);


    //Select Menu Interaction, ddinteraction=drop down interaction
    client_obj.once('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {                                      
            await ddinteraction.deferUpdate()                                     
            .then(() =>{
                //Save chosen tags
                for(let tag of ddinteraction.values){
                    // Find the post tag's tag id from database using the tagName
                    Tags.findAll({ where: { tagName: tag } })
                    .then(function (availableTags){
                        availableTags.forEach(function (aT){
                            console.log(aT.id);
                            // Create a post tag with the associated postid and tagid
                            PostTags.create({tagName: tag, postId: interaction.id, tagId: aT.id})
                        })
                    })
                    
                }

                // Store post and tags to database
                console.log(message);
                Posts.create({messageContent: message, id: interaction.id, userId: userID});

            })
            .catch(console.error);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you selected '+ ddinteraction.values, components: []})
            .then((message) => console.log(`Reply sent`))
            .catch(console.error);

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
    const user = await Users.findOne({
        where: {
            userId: userId
            }
        })
        .catch(false);
    console.log(user!=null);
    // return false if user[] is empty, otherwise, this user is registered
    // return user.length!==0;
    return user!=null;
}

async function getRegisteredUser(userId) {
    const user = await Users.findOne({
        where: {
            userId: userId
            }
        })
        .catch(false);
    return user;
}

async function getSubscribedTags(userId) {
    const user = await getRegisteredUser(userId);
    const tags = [];
    const subscriptions = await Subscriptions.findAll({ where: { userId: userId } })
        .catch(()=>{
            console.log(user+' has an error while getting the subscription')
        });
    for(const sub of subscriptions) {
        const name = await getTagName(sub.tagId);
        const obj = {tagName: name, id: sub.tagId};
        tags.push(obj);
    }
    return tags;
}

async function getSubscribedTagIds(userId) {
    const user = await getRegisteredUser(userId);
    const tagIds = new Set();
    const subscriptions = await Subscriptions.findAll({ where: { userId: userId } })
        .catch(()=>{
            console.log(user+' has an error while getting the subscription')
        });
    for(const sub of subscriptions) {
        tagIds.add(sub.tagId);
    }
    return tagIds;
}

async function getUnsubscribedTags(userId) {
    const subIds = await getSubscribedTagIds(userId);
    const unsubs = [];
    const allTags = await getAllTags();
    for(const tag of allTags) {
        if(!subIds.has(tag.id)) {
            unsubs.push(tag);
        }
    }
    return unsubs;
}

async function getAllTags() {
    const tags = await Tags.findAll()
        .catch(err=>console.log(err+'Error occur when trying the fetch all tags from DB'));
    return tags;
}

async function getTagName(tagId) {
    const tag = await Tags.findOne({
        attributes: ['tagName'],
        where: { id: tagId }
        })
        .catch(err=>{
            console.log('error occurs when searching this tag id: '+tagId)
        });
    if(tag && tag.tagName){
        return tag.tagName;
    }else{
        console.log(tagId);
        return 'tagName of '+tagId+' is undefined';
    }
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = { command_register, command_unregister, command_profile, command_subscribe, command_unsubscribe, command_post }
