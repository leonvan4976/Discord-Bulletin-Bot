/*
  This is a file that has a lot of "how-to-do" functions and example code
*/

//A function that prints something to console when the bot is run
function bot_login_debug(client_obj) {
  /*
    Syntax Breakdown
      0.  client_obj (the function argument) needs to be of Client type, 
          more info about Client type https://discord.js.org/#/docs/main/stable/class/Client

      1.  client_obj.on('ready') listens for the 'ready' event from the discord client
          'ready' is when the bot logs onto the server
        

      2.  () =>{} syntax is the function callback, it calls a function when an event is triggered
          In this case, it will log the discord bot's name into the console.
  */
  client_obj.on('ready', () => {
    console.log(`${client_obj.user.tag} has logged in`);
  });
}

//An example function that every message sent in the server and logs it to the console   
function bot_message_debug(client_obj) {
  /*
    Syntax Breakdown
      1.  'messageCreate' is the event to be listened to
          'messageCreate' event is triggered when anyone sends a message into the server.

      2.  (message) is the Message object, contains data regarding the sent message 
          https://discord.js.org/#/docs/main/stable/class/Message?
  */
  client_obj.on('messageCreate', (message) => {
    console.log(`[${message.author.tag}] : ${message.content} [${message.createdAt}]`);
  });
}


/*
    Module exporting:
        If you want a function to be used in a different javascript file, 
        input the function name in the exports list
*/
module.exports = { bot_login_debug, bot_message_debug }