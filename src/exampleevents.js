/*
  This is a file that has a lot of "how-to-do" functions and example code
*/


function bot_login_debug(client_obj){
    /*
      Syntax Breakdown
        0. client_obj (the function argument) needs to be of Client type, 
        more info about Client type https://discord.js.org/#/docs/main/stable/class/Client

        1. client_obj.on('ready') listens for the 'ready' event from the discord client

        2. () =>{} syntax is the function callback, it calls a function when an event is triggered
          In this case, it will log the discord bot's name into the console.
    */
    client_obj.on('ready', () =>{
        console.log(`${client_obj.user.tag} has logged in`);
      });
}




/*
    Module exporting:
        If you want a function to be used in a different javascript file, 
        input the function name in the exports list
*/
module.exports = {bot_login_debug}