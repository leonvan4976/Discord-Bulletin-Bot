/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton, User } = require('discord.js');
/*

*/
const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');
const { Op } = require("sequelize");

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
    displayMenu(client_obj,interaction, 'Here\'s a list of what you subscribed.',['1','2','3']);
}


// Let the user subscribe to tags
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
    client_obj.once('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Get all tag names of chosen tags
            let tagNameArr = await getTagNames(ddinteraction.values);

            //Delete message components                                    
            await ddinteraction.editReply({content: 'you subscribed to tag: '+ tagNameArr, embeds: [], components: []})
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

// Let the user unsubscribe to tags
async function command_unsubscribe(client_obj, interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    const userRegistered = await isUserRegistered(userIdVar);
    if ( !userRegistered ) {
        const response = `Hello ${userTag}, you have not registered yet. Use /register to register`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    const subscribedtags = await getSubscribedTags(userIdVar);
    if (subscribedtags.length===0) {
        const response = `Hello ${userTag}, you have not subscribe to any tag yet. Use /subscribe to subscribe`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    displayMenu(client_obj, interaction, "Select tags you want to unsubscribe!", subscribedtags);
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;
    client_obj.once('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // console.log(ddinteraction.user, ddinteraction.id, ddinteraction.component, componentId);
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {
            //console.log("Only the interaction component id associated with the msg's component id passes through!!")                                      
            await ddinteraction.deferUpdate()                                     
            .catch(console.error);

            //Get all tag names of chosen tags
            let tagNameArr = await getTagNames(ddinteraction.values);


            //Delete message components                                    
            await ddinteraction.editReply({content: 'you subscribed to tag: '+ tagNameArr, embeds: [], components: []})
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

// Save a message to the database with its associated tags and send the message to all subscribers
async function command_post(client_obj, interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;
    let message = interaction.options.getString('message');

    const userRegistered = await isUserRegistered(userID)
    .catch(e => console.error(e));
    if ( !userRegistered ) {
        const response = `Hello ${userTag}, you have not registered yet. Use /register to register`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }

    let response = `Hello ${userTag}, you are posting the message: ${message}`;


    //TODO: will import a list of tagas from database
    //just a demo tags list for now
    let demoTagsArr = ['cse101','cse130','cse140'];
    // Check if there are already tags in the database
    await Tags.findAndCountAll()
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


    const tags = await Tags.findAll()
    .catch(err => console.error(err));
    displayMenu(client_obj, interaction, "Select which tags you wanna post to!", tags);
    //Append a unique slash command interaction id to the component custom id
    let componentId = `select${interaction.id}`;
    //Select Menu Interaction, ddinteraction=drop down interaction
    client_obj.once('interactionCreate', async ddinteraction => {
        if (!ddinteraction.isSelectMenu()) return;
        // Compare the component id retrieved by the drop-down interaction with the current component id
        if (ddinteraction.customId === componentId) {                                      
            await ddinteraction.deferUpdate()
            .catch(console.error);                                     
            // Store post and tags to database
            let pId = await Posts.create({messageContent: message, userId: userID})
            .catch(err => { console.error('Invalid user id or tag id') });
            const subscribedUsers = await getSubscribedUsers(ddinteraction.values);
            await sendDMToUsers(client_obj, subscribedUsers, message);
            // Save chosen tags
            for(let tag of ddinteraction.values){
                // Find the post tag's tag name from database using the tagId
                Tags.findAll({ where: { id: tag } })
                .then(function (availableTags){
                    availableTags.forEach(function (aT){
                        // Create a post tag with the associated postid and tagid
                        PostTags.create({tagName: aT.tagName, postId: pId.id, tagId: tag})
                        .catch(err => { console.error('Invalid post id or tag id') });

                    })
                })
                .catch(err => console.error(err));
                
            }

            // Get all tag names of chosen tags
            let tagNameArr = await getTagNames(ddinteraction.values);

            // Delete message components                                
            await ddinteraction.editReply({content: `You posted "${message}" with the selected tags: ${tagNameArr}`, embeds: [], components: []})
            .then((message) => console.log(`Reply sent`))
            .catch(console.error);
            
            // Pull subscriptions
            // await sendSubscribedPosts(client_obj, ddinteraction.values);


        }
    })
}


// ************************************************************************

// helper functions

// DMs all subscribed users of the tags in selectTagArr
async function sendSubscribedPosts(client_obj, selectTagArr){
    for(let tag of selectTagArr){
        let subbedTags = await Subscriptions.findAll({ where: { tagId: tag } })
        .catch(err => console.error(err));

        let subbedPost = await PostTags.findAll({ where: { tagId: tag } })
        .catch(err => console.error(err));

        // Send Direct message all subscribed users with all posts associated with tag
        // Get the subbedTags' userIds and subbedPost's postId
        // let postArr = subbedPost.map(sP => sP.postId);

        for(let u of subbedTags){
            let user = await client_obj.users.fetch(u.userId)
            .catch(err => console.error(err));

            for(let sP of subbedPost){
                console.log(sP.tagName, sP.postId, sP.createdAt);
                let posts = await Posts.findAll({ where: { id: sP.postId } })
                .catch(err => console.error(err));
                
                await posts.forEach(p => {
                    user.send(p.messageContent);

                })

                //Destroy sent posts from database
                // await Posts.destroy({ where: { id: sP.postId } })
                // .catch(err => console.error(err));
            }
        }

    }
}


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
        const name = await getOneTagName(sub.tagId);
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

async function getOneTagName(tagId) {
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

// Get tag names from the Tags table using a constraint
async function getTagNames(constraint){
    //Get all tag names of chosen tags
    const nameTags = await Tags.findAll({
        where: { id: constraint }
    })
    .catch(err => console.error(err));
    return nameTags.map(nT => nT.tagName);
}

async function getSubscribedUsers(tagsArray){
    //Get all tag names of chosen tags
    const userSet = new Set();
    const users = await Subscriptions.findAll({
        attributes: ['userId'],
        where: { tagId: tagsArray }
    })
    .catch(err => console.error(err));
    console.log(users[1].dataValues.userId);
    users.forEach(user => {
        console.log(user.dataValues.userId+'add')
        userSet.add(user.dataValues.userId)
    });
    return Array.from(userSet);
}

// async function sendDMToUser(client_obj, userId, message) {
//     const user = client_obj.users.cache.get(userId);
//     console.log(user+'user');
//     await user.send(message);
// }

async function sendDMToUsers(client_obj, userIDArray, message) {
    console.log(userIDArray);
    userIDArray.map(async userId=> {
        const user = await client_obj.users.fetch(userId);
        console.log(user+'user')
        if(user!==undefined)
            await user.send(message);
    })
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = { command_register, command_unregister, button_unregister, command_profile, command_subscribe, command_unsubscribe, command_post }
