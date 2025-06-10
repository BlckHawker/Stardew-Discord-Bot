//todo add "request" as dependency 
require("dotenv").config();
const utils = require("../utils.js");
const fetch = require('node-fetch')


let cachedTwitchTokenObject;
let cachedStreamObject;

const sendLatestStreamMessage = async () => {
    console.log(`[${utils.getTimeStamp()}] Getting the latest Twitch stream...`);

    
    //todo check if hawker is streaming
    cachedStreamObject = await getStream();
    console.log(cachedStreamObject)
}

//Gets the stream if Hawker is currently live 
const getStream = async () => {
    //todo figure out if the access token is expired,  if it is, get a new one, otherwise keep using current one
    cachedTwitchTokenObject = await getTwitchTokenObject();

    if(cachedStreamObject === null) {
        console.error(`[${utils.getTimeStamp()}] Error getting twitch token object. Terminating getting stream`)
        return null;
    }

    //todo get stream if hawker is live
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

    // var options = {
    // 'method': 'GET',
    // 'url': `https://api.twitch.tv/helix/streams?user_id=${process.env.TWITCH_USER_ID}`,
    // 'headers': {
    //     'Client-Id': process.env.TWITCH_CLIENT_ID,
    //     'Authorization': `Bearer ${twitchAccessToken}`
    // }
    // };
    // request(options, function (error, response) {
    // if (error) {
    //     //todo refactor this to log the error and return null
    //     throw new Error(error);
    // }
    // console.log(response.body);
    // });
}

//todo comment this so it makes more sense
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

    //todo if there's a problem parsing the twitch token object, log an error
    if(!twitchTokenObject) {
        console.error(`[${utils.getTimeStamp()}] Error parsing twitch token object. Object came as ${twitchTokenObject}`)
        return null;
    }

    console.log(`[${utils.getTimeStamp()}] Successfully got twitch token object`);
    return twitchTokenObject;
}

module.exports = {
    sendLatestStreamMessage
};