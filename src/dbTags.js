const { Users, Posts, Subscriptions, Tags, PostTags } = require('./dbObjects.js');
const csv = require('csv-parser');
const fs = require('fs');



async function insertTag(dataRow){
    // First checks to see if the tag already exists
    const tag = await Tags.findAll({
        where: {tagName : dataRow.tagName}
    });

    if (tag.length != 0){
        // Updates the tag.
        console.log(`${dataRow.tagName} already exists in database, updating...`);
        // Updates the description of the tag
        await Tags.update(
            {
                tagDescription : dataRow.tagDescription
            },
            {
                where:{
                    tagName : dataRow.tagName,
                }
            }
        );
        return;
    }else{
        // Creates the tag.
        console.log(`${dataRow.tagName} inserted into database`);
        await Tags.create({ 
            tagName: dataRow.tagName,
            tagDescription: dataRow.tagDescription,
        });
        return;
    }
}

// Gets all of the relevant passed arguments 
// (Which are Arguments after the script execution arguments)
var myArgs = process.argv.slice(2);

// Simple error checking
if(myArgs.length != 1){
    console.log("Error in arguments passed into script,\nFollow the format in double quotes \" node src/dbTags.js 'myFile.csv' \" \nMake sure to wrap the file in single quotes.");
    return;
}

if(myArgs[0].search('.csv') == -1){
    console.log(`${myArgs[0]} is not a .csv file\nDid you forget to add .csv to the end of the file?`);
    return;
}

// Parses all of the comma seaprated data into their own fields.
// In the CSV file, the first row is the header row, which is converted to fields
// The rows after the first are data rows
const csvData = [];
fs.createReadStream(myArgs[0])
    .pipe(csv())
    .on('data', (dataRow) => {
        csvData.push(dataRow);
    })
    .on('end', () => {
        // Code being executed
        // console.log(csvData);
        // Insert the data into the database
        console.log("Inserting...");
        for (dataRow of csvData){
            insertTag(dataRow);
        }
    });