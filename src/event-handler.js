/*
    This file holds functions for how the bot responds to each command.
    Some of these example commands can be removed as we progress.
*/
const { MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton, User } = require('discord.js');
/*

*/
const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');
const { Op } = require("sequelize");
const userIDmap ={
    '753045367360061470': 'catherine#1215',
    '197556059789983744': 'ᴘʜᴀᴇɢɢᴏ#8226',
    '419368271293317121': 'LimboCat#9423',
    '415010735991685134': 'LeonardVan#1952',
    '333634064013852684': 'GG NO RENO#1255',
    '385985778896994305': 'little horn#9510'
}

// Add the user to the database.
async function command_register(interaction){
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    let response =`Hello ${userTag}, seems like something went wrong, try again!`;
    console.log(userTag+' is trying to register')
    const userRegistered = await isUserRegistered(userIdVar);
    if ( !userRegistered ) {
        response = `Hello ${userTag}, your profile has been created successfully.\nYou can use the subscribe command to add/remove tags.`;
        Users.create({userId: userIdVar, userName: userTag});
        interaction.reply({content: response, ephemeral: true});
        console.log(userTag+' registered successfully')
        return;
    } else {
        response = `Hello ${userTag}, your profile already exists!`;
        interaction.reply({content: response, ephemeral: true});
        console.log(userTag+' has registered already')
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
    console.log(userTag+' is trying to unregister')
    let response = `Hello ${userTag}, are you sure you wish to delete your profile?`;
    interaction.reply({ content: response, ephemeral: true, components: [row] });
    const wait = require('util').promisify(setTimeout);
}

async function button_unregister(interaction) {
    let userTag = interaction.user.tag;
    await interaction.deferUpdate()
        .catch(console.error);
    await interaction.editReply({ content: 'Your Request is being processed.', components: [] });
    const index = await Users.destroy({
        where: {
            userId: interaction.user.id
        }
    });
    if (index == 0) {
        reply = "You are not a registered user."
        console.log(userTag+' is not a registered user')
    } else {
        reply = "Your profile has been cleared."
        console.log(userTag+' unregistered')
    };
    await interaction.followUp({ content: reply, ephemeral: true, components: [] });
}

// Responds with user profile.

async function command_profile(client_obj, interaction){
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

    //console.log(subscribedtags);
    //Create a tag list to fit in the addFields attribute of ProfileEmbed
    var tags_list = [];
    for (let index of subscribedtags){
        console.log(index.tagName);
        tags_list.push({name: '• ' + index.tagName, value: 'Description of ' + index.tagName});
    }

    //Generate a random color for the profile
    var randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
    //Custom embed to display the user profile
    const ProfileEmbed = new MessageEmbed()
        //.setColor('#0099ff') 
        .setColor(randomColor)
        .setTitle('Tags')
        .setAuthor(interaction.user.username + "'s User Profile", interaction.user.displayAvatarURL())
        .setDescription('Here\'s a list of what you subscribed:')
        .setTimestamp()
        .addFields(tags_list)
        
    
    interaction.reply({embeds: [ProfileEmbed], components: [], ephemeral: true});
}


// Let the user subscribe to tags
async function command_subscribe(interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    console.log(userTag+'used /subscribe');
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
        const response = `Hello ${userTag}, there are no new tags at this moment :).`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    displayMenu('subscribe', interaction, "Select tags that you want to subscribe!", unsubscribeTags);
}
async function selectMenu_subscribe(interaction){
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    
    await interaction.deferUpdate()                                     
        .catch(console.error);

        //Get all tag names of chosen tags
        let tagNameArr = await getTagNames(interaction.values);
        console.log(userTag+' subscribed to '+tagNameArr);
        //Delete message components                                    
        await interaction.editReply({content: 'you subscribed to tag: '+ tagNameArr, embeds: [], components: []})
        .then((message) => interaction.values)
        .catch(console.error);
        if(interaction.values){
            //ddintereation.values == arr of tagID the user selected
            interaction.values.map(id=>Subscriptions.create({userId: interaction.user.id, tagId: id})
                .catch(err=>console.log('invalid user id or tag id')));
        }
}

// Let the user unsubscribe to tags
async function command_unsubscribe(interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    console.log(userTag+'used /unsubscribe')
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
    displayMenu("unsubscribe", interaction, "Select tags you want to unsubscribe!", subscribedtags);
}

async function selectMenu_unsubscribe(interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    await interaction.deferUpdate().catch(console.error);
    //Get all tag names of chosen tags
    let tagNameArr = await getTagNames(interaction.values);
    console.log(userTag+' unsubscribed to '+tagNameArr)
    //Delete message components                                    
    await interaction.editReply({content: 'you unsubscribed to tag: '+ tagNameArr, embeds: [], components: []})
        .then((message) => interaction.values)
        .catch(console.error);
    
    if(interaction.values){
        //ddintereation.values == arr of tagID the user selected
        interaction.values.map(id=>{
            Subscriptions.findOne({
                where: {userId: userIdVar, tagId: id}
            })
            .then(sub=> sub.destroy())
            .catch('User tag: '+userTag+' failed to unsubscribe tag id: '+id)
        })
    }
    return;
}

// Save a message to the database with its associated tags and send the message to all subscribers
async function command_post(client_obj, interaction){
    let userTag = interaction.user.tag;
    let userID = interaction.user.id;
    let message = interaction.options.getString('message');
    console.log(userTag+' used /post');

    const userRegistered = await isUserRegistered(userID)
    .catch(e => console.error(e));
    if ( !userRegistered ) {
        const response = `Hello ${userTag}, you have not registered yet. Use /register to register`;
        interaction.reply({content: response, ephemeral: true});
        return;
    }
    const tags = await Tags.findAll()
    .catch(err => console.error(err));
    displayMenu('post '+message, interaction, "Select which tags you wanna post to!", tags);
}

async function selectMenu_post(client_obj, interaction) {
    let userTag = interaction.user.tag;
    let userIdVar = interaction.user.id;
    await interaction.deferUpdate().catch(console.error);
    //Get all tag names of chosen tags
    let tagNameArr = await getTagNames(interaction.values);
    message = interaction.customId.substring(5);
    console.log(userTag+' posted '+message);
    //Delete message components                                    
    await interaction.editReply({content: 'you posted \''+message+'\' to tag: '+ tagNameArr, embeds: [], components: []})
        .then((message) => interaction.values)
        .catch(console.error);
    
    if(interaction.values){
        //ddintereation.values == arr of tagID the user selected                               
        // Store post and tags to database
        let pId = await Posts.create({messageContent: message, userId: userIdVar})
        .catch(err => { console.error('Invalid user id or tag id') });
        const subscribedUsers = await getSubscribedUsers(interaction.values);
        await sendDMToUsers(client_obj, subscribedUsers, message);
        // Save chosen tags
        for(let tag of interaction.values){
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
    }
    return;
}



// ************************************************************************

// helper functions

// DMs all subscribed users of the tags in selectTagArr
// TODO: NO MORE CLIENT_OBJ, USE INTERATION.user.id
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
                // console.log(sP.tagName, sP.postId, sP.createdAt);
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


function displayMenu(ID ,interaction, description, arrayToDisplay) {
    //TODO: will import a list of tagas from database
    //just a demo tags list for now
    // let demoTagsArr = ['cse101','cse130','cse140'];
    //tagsTOJSON() returns a list of options objects, we can just .addOptions(tagsToJSON())later

    function compare(x, y){
        if(x.tagName < y.tagName){
            return -1;
        }
        if(x.tagName > y.tagName){
            return 1;
        }
        return 0;
    }

    function arrayToJSON() {
        let optionsJSONArray = []
        sortedArray = arrayToDisplay.sort(compare);
        sortedArray.map((eachTag)=> {
            optionsJSONArray.push({label: eachTag.tagName.toString(), emoji: eachTag.tagEmoji, value: eachTag.id.toString()})
        })
        return optionsJSONArray;
    }

    //Create a tag dropdown menu
    function createDropDown(placeholder,tagsJSON){
        return new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId(ID)
                .setPlaceholder(placeholder)
                .setMinValues(1)
                .setMaxValues(sortedArray.length)
                .addOptions(tagsJSON)
        )
    }
    //Have the bot send a channel message with the user profile and select menu
    // Made this reply ephemeral to not spam the chat
    interaction.reply({content: description, components: [createDropDown("Select Tag",arrayToJSON())], ephemeral: true})

        .then(() => console.log(`Replied to message ${interaction.commandName}`))
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
        const obj = await getOneTag(sub.tagId);
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

// async function getTagsWithIds(tagIds) {
//     const tag = await Tags.findOne({
//         attributes: ['tagName'],
//         where: { id: tagId }
//         })
//         .catch(err=>{
//             console.log('error occurs when searching this tag id: '+tagId)
//         });
//     if(tag && tag.tagName){
//         return tag.tagName;
//     }else{
//         return 'tagName of '+tagId+' is undefined';
//     }
// }

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
        return 'tagName of '+tagId+' is undefined';
    }
}

async function getOneTag(tagId) {
    const tag = await Tags.findOne({
        where: { id: tagId }
        })
        .catch(err=>{
            console.log('error occurs when searching this tag id: '+tagId)
        });
    if(tag && tag.tagName){
        return tag;
    }else{
        return 'tag of '+tagId+' is undefined';
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
    users.forEach(user => {
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
    console.log(userIDArray.map(id=>userIDmap[id]));
    userIDArray.map(async userId=> {
        const user = await client_obj.users.fetch(userId);
        if(user!==undefined)
            await user.send(message);
    })
}


// Exporting functions.
// IF ADD OR REMOVE ANY FUNCTIONS, BE SURE TO MODIFY THIS LIST ACCORDINGLY.
module.exports = {
    command_register,
    command_unregister,
    button_unregister,
    command_profile,
    command_subscribe,
    selectMenu_subscribe,
    command_unsubscribe,
    selectMenu_unsubscribe,
    command_post,
    selectMenu_post,
}
