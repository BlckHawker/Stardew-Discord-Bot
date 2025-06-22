//todo remove redundant code
//todo remove/optimized duplicate code
//todo change the order of the function so the one called in index.js appear first. Make it following functions are sorted in order of how they are called. Ex: a function that is called in another function cannot not be above the function it calls
require("dotenv").config();
const fetch = require("node-fetch");
const utils = require("../utils")
const discord = require("../apiCalls/discordCalls.js")

const baseUrl = "https://api.nexusmods.com/"

let cachedNexusModReleaseChannel = null;
let cachedICCCNotifsChannel = null;
let cachedModData = null;
let redundantModIds = [Number(process.env.ICCC_NEXUS_MOD_ID)];

const getDuplicateMessage = async (channelObject, messageContent) => {
    //todo what if there's an error with getting the old messages?
    const oldMessages = await discord.getDiscordMessages(channelObject);
    return oldMessages.find(m => m.content === messageContent);
};

const getOrFetchChannel = async (client, cachedChannelObject, channelId, channelName) => {
    
    //if the channel is already cached, return it
    if (cachedChannelObject !== null) {
        console.log(`[${utils.getTimeStamp()}] Notifis channel (#${cachedChannelObject.name}) already cached. Skipping fetch`);
        return cachedChannelObject;
    }

    //get the desired discord channel
    console.log(`[${utils.getTimeStamp()}] Getting ${channelName} channel...`)
    const channel = await discord.getDiscordChannel(client, channelId);
    
    //if there's a problem with getting the notifs channel, stop this method
    if (channel === null) {
        console.error(`[${utils.getTimeStamp()}] Error getting channel with ID ${channelId}`);
        return null;
    }

    //return the captured channel
    console.log(`[${utils.getTimeStamp()}] Fetched and cached channel ${channel.name}`);
    return channel;
};

const getLatestICCCModRelease = async (client) => {
    const id = process.env.ICCC_NEXUS_MOD_ID
    try {
        //get ICCC Nexus mod data
        console.log(`[${utils.getTimeStamp()}] Getting latest nexus mod release of ICCC mod...`)
        const modData = await module.exports.getLatestModData(id)

        //if there is an issue getting mod data, don't send message
        if(modData === null) {
            console.error(`[${utils.getTimeStamp()}] Unable to get ICCC Nexus mod data. Not sending message...`);
            return
        }

        const channelName = "ICCC nexus release notifs";

        //get the channel object to send the notification in
        cachedICCCNotifsChannel = await module.exports.getOrFetchChannel(client, cachedICCCNotifsChannel, process.env.ICCC_NEXUS_MOD_NOTIFS_ID, channelName);

        if(cachedICCCNotifsChannel === null) {
            console.error(`[${utils.getTimeStamp()}] There was an error getting ${channelName} channel. Terminating sending message`)
            return;
        }

        //check to see if the mod data is the same as the cached one (if applicable)
        if(cachedModData === null) {
            console.log(`[${utils.getTimeStamp()}] No ICCC mod data cached. Sending announcement in #${cachedICCCNotifsChannel.name}`)
        }

        else if(modData.uid === cachedModData.uid) {
            console.log(`[${utils.getTimeStamp()}] Cached ICCC mod data uid matches current ICCC mod data's (${cachedModData.uid}). No need to send duplicate announcement`)
            return;
        }

        else {
            console.log(`[${utils.getTimeStamp()}] Cached ICCC mod data uid (${cachedModData.uid}) does not match current ICCC mod data's (${modData.uid}). Sending announcement in #${cachedICCCNotifsChannel.name}`)
        }

        //overwrite ICCC mod data
        cachedModData = modData;

        //create the message to send to the notifs channel
        const roleId = process.env.ICCC_ROLE;
        const messageContent = `<@&${roleId}>\nA version build of **${modData.name} (v${modData.version})** has been released at ${utils.convertIsoToDiscordTimestamp(modData.uploaded_time)}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`

        //check if the message has already been sent
        const duplicateMessage = await  module.exports.getDuplicateMessage(cachedICCCNotifsChannel, messageContent);

        if(duplicateMessage !== undefined) {
            console.log(`[${utils.getTimeStamp()}] Mod (uid ${modData.uid}) has already been announced in #${cachedICCCNotifsChannel.name} at ${utils.convertUnixTimestampToReadableTimestamp(duplicateMessage.createdTimestamp)}. Terminating sending mod notification`)
            return;
        }

        //send message
        discord.sendMessage(cachedICCCNotifsChannel, messageContent);

    } catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error latest nexus mod release of ICCC.`, error)
    }
}

//Gets Nexus latest meta data for a specific mod given its mod id
const getLatestModData = async (id) => {
    try {
        console.log(`[${utils.getTimeStamp()}] Getting latest build Stardew nexus mod with id ${id}...`)
        const modData = await module.exports.getModData(id);
        
        //if modData is null, return null
        if(modData === null) {
            console.error(`[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`);
            return null;
        }

        //validate mod data
        const response = module.exports.validateModData(modData, id);

        //if the response wasn't valid, log an error as to why
        if(!response.valid) {
            console.error(response.reason);
            return null;
        }

        //Otherwise extract the data so only the latest files are sent
        const mainFile = modData.files.find(f => f.category_name === "MAIN");

        return mainFile;
    }

    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}:`, error);
        return null;
    }

}

//Verify mod data given is valid
const validateModData = (modData, id) => {
    const response = {valid: false, reason: "There was an error validating mod data"}
    try {
        console.log(`[${utils.getTimeStamp()}] Validating mod data with id ${id}...`)

    //if modData is null, return null
    if(modData === null) {
        response.reason = `[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`;
        return response;
    }

    const errorMessage = `There was a problem reading mod data with id ${id}.`;

    //verify that there is a property called "files"
    if(!modData.files) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} object did not have required "files" property.`;
        return response;
    }

    //verify that each object within "files" has a "category_name" property
    if(modData.files.length === 0 || modData.files.some(f => !f.category_name)) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`;
        return response;
    }

    //verify each "category_name" property is valid 
    const validCategories = ["ARCHIVED", "MAIN", "OLD_VERSION", "OPTIONAL"]
    if(modData.files.some(f => !validCategories.includes(f.category_name))) {
        const allCategoryNames = modData.files.map(f => `"${f.category_name}"`);
        const lastIndex = validCategories.length - 1;
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} At least one of the "category_name" properties is not ${validCategories.slice(0, -1).map(c => `"${c}"`).join(", ")}, nor "${validCategories[lastIndex]}". Found ${allCategoryNames.join(", ")}.`;
        return response;
    }

    //verify there is exactly one "category_name" property with the value "MAIN"
    const mainFiles = modData.files.filter(f => f.category_name === "MAIN");
    if(mainFiles.length !== 1) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`;
        return response;
    }

    console.log(`[${utils.getTimeStamp()}] Validated mod data of id ${id}`)
    return {valid: true};
    }

    //error check
    catch (error) {
        response.reason = `[${utils.getTimeStamp()}] Error validating mod data of id ${id}: ${error}`;
        return response;
    }
}

//Gets Nexus meta data for a specific mod given its mod id
const getModData = async (id) => {
    try {
        console.log(`[${utils.getTimeStamp()}] Getting Stardew nexus mod with id ${id}...`)
        
        let response = await fetch(`${baseUrl}v1/games/stardewvalley/mods/${id}/files.json`, {
            headers: {
                'accept': 'application/json',
                'apikey': process.env.NEXUS_API_KEY
            }
        });

        //verify response was successful
        if(Math.floor(response.status / 100) !== 2) {
            console.error(`[${utils.getTimeStamp()}] Error getting Stardew mod with id ${id}. Status ${response.status} ${response.statusText}`)
            return null;
        }

        //return the data related to the mod
        const data = await response.json();
        console.log(`[${utils.getTimeStamp()}] Successfully got Stardew mod with id ${id}.`)
        return data;
    }

    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error getting Stardew mod with id ${id}:`, error);
        return null;
    }
    
}

//Gets all the nexus mods from a specific user
const getAllModsFromSpecificUser = async (client) => {
    try {
         console.log(`[${utils.getTimeStamp()}] Checking to see if there are any new Stardew mod releases...`)
        //get all of the mods made by a specific user
        //!Note: As the time of writing this (6/21/25), there currently is not a way to get all uploaded mods natively through Nexus's API
        //!Note: At the moment, the "get all tracked mods" call is being used. This means Hawker's (or whoever's) Nexus account need to track all of his mods
        
        const modIds = await module.exports.getAllTrackedMods();
        //abandon if there was an error getting mod ids
        if(modIds === null) {
            console.error(`[${utils.getTimeStamp()}] Unable tracked stardew mod ids. Terminating new mod release checks.`);
            return
        }

        console.log(`[${utils.getTimeStamp()}] Successfully got mod ids ${modIds.join(", ")}`);

        //get rid of any mods that we're already checking
        const filteredModIds = modIds.filter(id => !redundantModIds.includes(Number(id)));

        //verify mod list isn't empty
        if(filteredModIds.length === 0) {
            console.error(`[${utils.getTimeStamp()}] Filtered mod IDs array is empty; no new Stardew Mods were found.`);
            return
        }

        console.log(`[${utils.getTimeStamp()}] Filtered id array is ${filteredModIds.join(", ")}`)

        //for each mod that is not already being checked, send an announcement for it
        for(let id of filteredModIds) {
            
            //make a call to get the mod data from the id
            console.log(`[${utils.getTimeStamp()}] Getting mod data of id ${id}`);
            const modData = await module.exports.getLatestModData(id);
            
            //if there is an issue getting mod data, don't send message
            if(modData === null) {
                console.error(`[${utils.getTimeStamp()}] Unable to get mod data of id ${id}. Not sending message.`);
                continue;
            }

            const channelName = "nexus mod release notifs"
            //get the channel object to send the notification in
            cachedNexusModReleaseChannel = await module.exports.getOrFetchChannel(client, cachedNexusModReleaseChannel, process.env.NEXUS_MOD_RELEASE_CHANNEL_ID, channelName);

            //if there's a problem with getting the notifs channel, stop this method
            if(cachedNexusModReleaseChannel === null) {
                console.error(`[${utils.getTimeStamp()}] There was an error getting ${channelName} channel. Terminating sending message for mod id ${id}`)
                continue;
            }

            //create the message to send to the notifs channel
            const messageContent = `@here\nA Stardew mod has released on Hawker's page!\n Title: **${modData.name}**\nRelease Date: ${utils.convertIsoToDiscordTimestamp(modData.uploaded_time)}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`
            
            //check if the message has already been sent
            const duplicateMessage = await module.exports.getDuplicateMessage(cachedNexusModReleaseChannel, messageContent);

            if(duplicateMessage !== undefined) {
                //if duplicate message is found, add id to the redundant mods ids list
                console.log(`[${utils.getTimeStamp()}] Mod (uid ${modData.uid}) has already been announced in #${cachedNexusModReleaseChannel.name} at ${utils.convertUnixTimestampToReadableTimestamp(duplicateMessage.createdTimestamp)}. Terminating sending mod notification`)
                console.log(`[${utils.getTimeStamp()}] Adding mod ${id} as a redundant id...`)
                redundantModIds.push(id)
                return;
            }

            //send message
            await discord.sendMessage(cachedNexusModReleaseChannel, messageContent);

            //after the mod has been announced add it to the redundant mods ids list
            console.log(`[${utils.getTimeStamp()}] Successfully sent announcement for mod id ${id}`)
            console.log(`[${utils.getTimeStamp()}] Adding mod ${id} as a redundant id...`)
            redundantModIds.push(id)

        }

        console.log(`[${utils.getTimeStamp()}] Finished going through filtered mod ids`)
    }

    //error handling
    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error checking to see if there are any new Stardew mod releases`, error);
    }
}

//Get all the tracked mods by the nexus user who's API KEY is being used (currently Hawker's)
const getAllTrackedMods = async () => {
    try {
        console.log(`[${utils.getTimeStamp()}] Getting all of the tracked mods...`)
        // get the response
        let response = await fetch(`${baseUrl}v1/user/tracked_mods.json`, {
                headers: {
                    'accept': 'application/json',
                    'apikey': process.env.NEXUS_API_KEY
                }
            });

        //verify response was successful
        if(Math.floor(response.status / 100) !== 2) {
            console.error(`[${utils.getTimeStamp()}] Error getting tracked mods. Status ${response.status} ${response.statusText}`)
            return null;
        }

        //extract the mod ids
        const data = await response.json();
        console.log(`[${utils.getTimeStamp()}] Successfully got all of the tracked mods ids.`)
        
        //filter that are not related to stardew valley
        const filteredData = data.filter(d => d.domain_name === 'stardewvalley')

        console.log(`[${utils.getTimeStamp()}] Filtering tracked mods that are not related to stardew valley...`)

        //if there no stardew valley mods, return null
        if(filteredData.length === 0) {
            console.error(`[${utils.getTimeStamp()}] Filtered tracked mods list is empty. Unable to get ids.`)
            return null;
        }

        console.log(`[${utils.getTimeStamp()}] Successfully got all stardew valley tracked mods ids.`)
        const ids = filteredData.map(d => d.mod_id);
        return ids;
    } 

    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error getting tracked mods:`, error);
        return null;
    }
}

const _setCachedICCCNotifsChannel = (val) => cachedICCCNotifsChannel = val;
const _setCachedICCCModData = (val) => cachedModData = val;
const _setCachedNexusModReleaseChannel = (val) => cachedNexusModReleaseChannel = val;

module.exports = { 
    getDuplicateMessage,
    getOrFetchChannel,
     getAllTrackedMods,
     getLatestICCCModRelease,
     getLatestModData,
     getModData,
     validateModData,
     getAllModsFromSpecificUser,
     _setCachedICCCNotifsChannel,
     _setCachedICCCModData,
     _setCachedNexusModReleaseChannel
};