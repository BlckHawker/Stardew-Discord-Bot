require("dotenv").config();
const utils = require("../utils.js");
const discord = require("../apiCalls/discordCalls.js")
const fetch = require('node-fetch')

let cachedNotifsChannel = null;
let cachedTwitchTokenObject = null;
let cachedStreamObject = null;

const sendLatestStreamMessage = async (client) => {
    console.log(`[${utils.getTimeStamp()}] Getting the latest Twitch stream...`);

    
    //check if hawker is streaming
    const streamObject = await getStream();

    //check if there were any problems with getting the stream
    if(streamObject === null) {
        console.error(`[${utils.getTimeStamp()}] Could not find live Hawker stream. Unable to send twitch message`)
        return;
    }

    //get the channel object to send the notification in
    if(cachedNotifsChannel === null) {
        console.log(`[${utils.getTimeStamp()}] Getting stream notifs channel...`)
        cachedNotifsChannel = await discord.getDiscordChannel(client, process.env.STREAM_NOTIFS_CHANNEL_ID)

        //if there's a problem with getting the notifs channel, stop this method
        if(cachedNotifsChannel === null) {
            console.error(`[${utils.getTimeStamp()}] There was an error getting stream notifs channel. Terminating sending message`)
            return;
        }

        console.log(`[${utils.getTimeStamp()}] Stream notifs channel gotten successfully`)
    }

    else {
        console.log(`[${utils.getTimeStamp()}] Notifis channel (#${cachedNotifsChannel.name}) already cached. Skipping fetch`);
    }

    //check if the stream object is the same as the cached one (if applicable)
    if(cachedStreamObject === null) {
        console.log(`[${utils.getTimeStamp()}] No stream cached. Sending announcement in #${cachedNotifsChannel.name}`)
    }
    
    else if(streamObject.id === cachedStreamObject.id) {
        console.log(`[${utils.getTimeStamp()}] Cached stream object id matches current stream object's (${streamObject.id}). No need to send duplicate announcement`)
        return;
    }

    else {
        console.log(`[${utils.getTimeStamp()}] Cached stream object id (${cachedStreamObject.id}) does not match current stream object's (${streamObject.id}). Sending announcement in #${cachedNotifsChannel.name}`)
    }

    //overwrite cached stream object
    cachedStreamObject = streamObject;

    //check if the stream is stardew related
    const stardewRelated = isStardewRelated(streamObject);

    //get the correct role to ping based on if the stream is stardewRelated
    const roleId = getCorrectRole(stardewRelated);

    //create the message to send to the notifs channel
    const messageContent = `<@&${roleId}>\nHawker is live on twitch!\nStarted streaming at ${utils.convertIsoToDiscordTimestamp(streamObject.started_at)}\nTitle: **${streamObject.title}**\nWatch here: https://www.twitch.tv/${streamObject.user_login}`

    //check if this stream has already been announced
    const oldNotifMessages = await discord.getDiscordMessages(cachedNotifsChannel);

    const duplicateMessage = oldNotifMessages.find(m => m.content === messageContent);

    if(duplicateMessage !== undefined) {
        console.log(`[${utils.getTimeStamp()}] Stream (id ${streamObject.id}) has already been announced in #${cachedNotifsChannel.name} at ${utils.convertUnixTimestampToReadableTimestamp(duplicateMessage.createdTimestamp)}. Terminating sending stream notification`)
        return;
    }

    //send message
    discord.sendMessage(cachedNotifsChannel, messageContent);
}

const isStardewRelated = (stream) => {
    const keyword = "STARDEW";

    //the stream is considered Stardew related if any of the following are true:

    //if the title contains the word "STARDEW"
    if(stream.title.toUpperCase().includes(keyword)) {
        console.log(`[${utils.getTimeStamp()}] Stream is Stardew related because the title contains "STARDEW"`);
        return true;
    }

     //If at least one of the tags contain "Stardew"
    if(stream.tags.some(tag => tag.toUpperCase().includes(keyword))) {
        console.log(`[${utils.getTimeStamp()}] Stream is Stardew related because at least one tag contains "STARDEW"`);
        return true;
    }

    //If the game being played is Stardew Valley
    if(stream.game_name.toUpperCase() === "STARDEW VALLEY") {
        console.log(`[${utils.getTimeStamp()}] Stream is Stardew related because game is "Stardew Valley"`);
        return true;
    }

    console.log(`[${utils.getTimeStamp()}] Stream is not Stardew related`);
    return false;

}

//Gets the stream if Hawker is currently live 
const getStream = async () => {
    //figure out if the access token is expired, if it is, get a new one, otherwise keep using current one
    const minuteOffset = 5; // Refresh the token this many minutes before it actually expires to avoid using an expired token

    if(cachedTwitchTokenObject !== null) {
        console.log(`[${utils.getTimeStamp()}] Twitch token is cached, checking to see when expired`)
        const expirationTime = cachedTwitchTokenObject.expirationTime;
        const minutesExpirationTime = expirationTime - minuteOffset * 60 * 1000
        console.log(`[${utils.getTimeStamp()}] Original expiration time: ${utils.convertUnixTimestampToReadableTimestamp(expirationTime)}`)
        console.log(`[${utils.getTimeStamp()}] ${minuteOffset} minutes before expiration time: ${utils.convertUnixTimestampToReadableTimestamp(minutesExpirationTime)}`)

        if(Date.now() > minutesExpirationTime) {
            console.log(`[${utils.getTimeStamp()}] Current time is less than 5 minutes before expiration time. Getting new token`)
            cachedTwitchTokenObject = await getTwitchTokenObject();
        }
        else {
            console.log(`[${utils.getTimeStamp()}] Current time is more than 5 minutes before expiration time. Using cached token`)
        }
    }

    else {
        console.log(`[${utils.getTimeStamp()}] Twitch token is not cached. Getting new token`);
        cachedTwitchTokenObject = await getTwitchTokenObject();
    }


    if(cachedTwitchTokenObject === null) {
        console.error(`[${utils.getTimeStamp()}] Error getting twitch token object. Terminating getting stream`)
        return null;
    }

    //get stream if hawker is live
    let response = await fetch("https://api.twitch.tv/helix/streams?" 
        + new URLSearchParams({
            "user_id": process.env.TWITCH_USER_ID,
            "type": "live"
        }), {
        method: "GET",
        headers: {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${cachedTwitchTokenObject.access_token}`
        }
    })

    //verify response was successful
    if(Math.floor(response.status / 100) !== 2) {
        console.error(`[${utils.getTimeStamp()}] Error getting latest twitch stream. Status ${response.status} ${response.statusText}`)
        return null;
    }

    let stream = await response.json();

    //verify stream data isn't empty
    if(stream.data.length === 0) {
        console.error(`[${utils.getTimeStamp()}] Could not find live Hawker stream`)
        return null;
    }

    console.log(`[${utils.getTimeStamp()}] Successfully got stream data`);
    return stream.data[0];
}

//Get the twitch token object used to use the twitch api
const getTwitchTokenObject = async () => {

    let response = await fetch("https://id.twitch.tv/oauth2/token?" 
        + new URLSearchParams({
            "client_id": process.env.TWITCH_CLIENT_ID,
            "client_secret": process.env.TWITCH_CLIENT_SECRET,
            "grant_type": "client_credentials"
        }), {
        method: "POST",
    })

    //verify the status is good
    if(Math.floor(response.status / 100) !== 2) {
        console.error(`[${utils.getTimeStamp()}] Error getting twitch token. Status ${response.status} ${response.statusText}`)
        return null;
    }

    //parse the twitch token object
    let twitchTokenObject = await response.json();

    //if there's a problem parsing the twitch token object, log an error
    if(!twitchTokenObject) {
        console.error(`[${utils.getTimeStamp()}] Error parsing twitch token object. Object came as ${twitchTokenObject}`)
        return null;
    }

    //set expiration time for token
    twitchTokenObject.expirationTime = Date.now() + twitchTokenObject.expires_in * 1000;

    console.log(`[${utils.getTimeStamp()}] Successfully got twitch token object`);
    return twitchTokenObject;
}

//if bool is true, sends id of stardew stream role, otherwise sends id of other stream role
const getCorrectRole = (isStardewRelated) => {
    return isStardewRelated ? process.env.TWITCH_STARDEW_STREAM_ROLE : process.env.TWITCH_OTHER_STREAM_ROLE
}

const _setCachedTwitchTokenObject = (val) => cachedTwitchTokenObject = val;
const _getCachedTwitchTokenObject = () => cachedTwitchTokenObject;
const _setCachedStreamObject = (val) => cachedStreamObject = val;
const _setCachedNotifsChannel = (val) => cachedNotifsChannel = val;


module.exports = {
    getTwitchTokenObject, sendLatestStreamMessage, isStardewRelated, getCorrectRole, _setCachedTwitchTokenObject, _getCachedTwitchTokenObject, getStream, _setCachedStreamObject, _setCachedNotifsChannel
};