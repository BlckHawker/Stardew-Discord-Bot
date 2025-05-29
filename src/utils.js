require("dotenv").config();
const Discord = require('discord.js');

//Sends a message to a server channel
//client - the client object
//content - the content that will be sent
//id - the id of the channel
const sendServerMessage = (client, content, id = process.env.DEBUG_CHANNEL_ID) => {
    client.channels.cache.get(id).send(content);
}

//Sends a message to a person via dm
//client - the client object
//content - the content that will be sent
//id - the id of the person to send dms to
const sendDM = (client, content, id) => {
    client.users.send(id, content);
}

//Creates a new Discord client instance
//intents - 
// partials - 
const createClient = (indents, partials) => {
    return new Discord.Client({
        intents: indents,
        partials: partials
    })
}

const convertIsoToDiscordTimestamp = (isoString, style) => {
    /* Style options:
     * none - December 31, 1969 7:00 PM
     * "t" - 7:00 PM
     * "T" - 7:00:00 PM
     * "d" - December 31, 1969
     * "D" - Thursday, December 31, 1969
     * "f" - December 31, 1969 7:00 PM
     * "F" - Thursday, December 31, 1969 7:00:00 PM
     * "R" - 53 years ago
     */
  const date = new Date(isoString);
  const unix = Math.floor(date.getTime() / 1000);
  if(!style)
    return `<t:${unix}>`;

  return `<t:${unix}:${style}>`;
};

// Converts a Unix timestamp to a human-readable format
// Example: 0 => 01-01-1970 00:00:00
const convertUnixTimestampToReadableTimestamp = (unixTimestamp) => {
    const d = new Date(unixTimestamp);
     dateStr = `${padStart(d.getMonth()+1)}-${padStart(d.getDate())}-${d.getFullYear()} ${padStart(d.getHours())}:${padStart(d.getMinutes())}:${padStart(d.getSeconds())}`
     return dateStr;

}

// Converts an ISO 8601 date string to a human-readable format
// Example: "1970-01-01T00:00:00Z" => 01-01-1970 00:00:00
const convertIsoToReadableTimestamp = (isoString) => {
    const date = new Date(isoString);
    return convertUnixTimestampToReadableTimestamp(date.getTime());
}

//Get the timestamp of the current time in seconds
const getTimeStamp =() => {
    return convertIsoToReadableTimestamp(new Date().toISOString());
}

//Formats number to be two digits with leading zero if necessary
const padStart = (num) => String(num).padStart(2, '0');





module.exports = { sendServerMessage, sendDM, createClient, convertIsoToDiscordTimestamp, convertUnixTimestampToReadableTimestamp, getTimeStamp };