/*
    core.js holds the major functions required needed for the core functionality of the bot.
*/

//Leonard has been here
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

    client_obj.on('messageCreate', (message) => {
        let command_list = (String(message.content)).match(reg_ex);
        if(command_list == null){
            //If no commands are found, return null
            return null;
        }else{
            //author is the identification of the discord user who sent the message
            let author = message.author;
            //Code to send a response to the user who used a command
            author.send("The commands you have sent to the bot is: " + command_list.toString());
            return { 'author' : author , 'command_list' : command_list};
        }
    });
}


module.exports = {command_scan}