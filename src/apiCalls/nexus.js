//todo remove redundant code
//todo remove/optimized duplicate code
require("dotenv").config();
const fetch = require("node-fetch");
const utils = require("../utils")
const discord = require("../apiCalls/discordCalls.js")

const baseUrl = "https://api.nexusmods.com/"

let cachedNexusModReleaseChannel = null;
let cachedICCCNotifsChannel = null;
let cachedModData = null;
let redundantModIds = [Number(process.env.ICCC_NEXUS_MOD_ID)];

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

        //get the channel object to send the notification in
        if(cachedICCCNotifsChannel === null) {
            console.log(`[${utils.getTimeStamp()}] Getting ICCC nexus release notifs channel...`)
            cachedICCCNotifsChannel = await discord.getDiscordChannel(client, process.env.ICCC_NEXUS_MOD_NOTIFS_ID)

            //if there's a problem with getting the notifs channel, stop this method
            if(cachedICCCNotifsChannel === null) {
                console.error(`[${utils.getTimeStamp()}] There was an error getting ICCC nexus notifs channel. Terminating sending message`)
                return;
            }

            console.log(`[${utils.getTimeStamp()}] ICCC nexus notifs channel gotten successfully`)
        }

        //skip fetching channel if already cached
        else {
            console.log(`[${utils.getTimeStamp()}] Notifis channel (#${cachedICCCNotifsChannel.name}) already cached. Skipping fetch`);
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
        const oldNotifsMessages = await discord.getDiscordMessages(cachedICCCNotifsChannel);
        
        const duplicateMessage = oldNotifsMessages.find(m => m.content === messageContent);

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

        //todo validate mod data
        const response = validateModData(modData, id);

        //todo if the response wasn't valid, log an error as to why
        if(!response.valid) {
            console.error(response.reason);
            return null;
        }

        //todo Otherwise extract the data so only the latest files are sent
        const mainFiles = modData.files.filter(f => f.category_name === "MAIN");

        return mainFiles[0];
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

    //todo if modData is null, return null
    if(modData === null) {
        response.reason = `[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`;
        return response;
    }

    const errorMessage = `There was a problem reading mod data with id ${id}.`;

    //todo verify that there is a property called "files"
    if(!modData.files) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} object did not have required "files" property.`;
        return response;
    }

    //todo verify that each object within "files" has a "category_name" property
    if(modData.files.length === 0 || modData.files.some(f => !f.category_name)) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`;
        return response;
    }

    const validCategories = ["ARCHIVED", "MAIN", "OLD_VERSION", "OPTIONAL"]
    //todo verify each "category_name" property is either "OLD_VERSION", "ARCHIVED" or "MAIN"
    if(modData.files.some(f => !validCategories.includes(f.category_name))) {
        const allCategoryNames = modData.files.map(f => `"${f.category_name}"`);
        //todo optimize this so it uses validCategories array
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} At least one of the "category_name" properties is not "OLD_VERSION", "ARCHIVED", "OPTIONAL", nor "MAIN". Found ${allCategoryNames.join(", ")}.`;
        return response;
    }

    //todo verify there is exactly one "category_name" property with the value "MAIN"
    const mainFiles = modData.files.filter(f => f.category_name === "MAIN");
    if(mainFiles.length !== 1) {
        response.reason = `[${utils.getTimeStamp()}] ${errorMessage} There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`;
        return response;
    }

    console.log(`[${utils.getTimeStamp()}] Validated mod data of id ${id}`)
    return {valid: true};
    }

    //todo error check
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
        
        const modIds = await getAllTrackedMods();
        //abandon if there was an error getting mod ids
        if(modIds === null) {
            console.error(`[${utils.getTimeStamp()}] Unable tracked stardew mod ids. Terminating new mod release checks...`);
            return
        }

        console.log(`[${utils.getTimeStamp()}] Successfully got mod ids ${modIds.join(",")}`);

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
                console.error(`[${utils.getTimeStamp()}] Unable to get mod data of id ${id}. Not sending message...`);
                continue;
            }

            //get the channel object to send the notification in
            if(cachedNexusModReleaseChannel === null) {
                console.log(`[${utils.getTimeStamp()}] Getting nexus mod release notifs channel...`)
                cachedNexusModReleaseChannel = await discord.getDiscordChannel(client, process.env.NEXUS_MOD_RELEASE_CHANNEL_ID)
                
                //if there's a problem with getting the notifs channel, stop this method
                if(cachedNexusModReleaseChannel === null) {
                    console.error(`[${utils.getTimeStamp()}] There was an error getting nexus mod release notifs channel. Terminating sending message for mod id ${id}`)
                    continue;
                }

                console.log(`[${utils.getTimeStamp()}] nexus mod release notifs channel gotten successfully`)
            }

            //skip fetching channel if already cached
            else {
                console.log(`[${utils.getTimeStamp()}] Notifis channel (#${cachedNexusModReleaseChannel.name}) already cached. Skipping fetch`);
            }

            //create the message to send to the notifs channel
            const messageContent = `@here\nA Stardew mod has released on Hawker's page!\n Title: **${modData.name}**\nRelease Date: ${utils.convertIsoToDiscordTimestamp(modData.uploaded_time)}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`
            
            //check if the message has already been sent
            const oldNotifsMessages = await discord.getDiscordMessages(cachedNexusModReleaseChannel);
            const duplicateMessage = oldNotifsMessages.find(m => m.content === messageContent);

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
        const ids = data.map(d => d.mod_id);
        console.log(`[${utils.getTimeStamp()}] Successfully got all of the tracked mods ids.`)
        return ids;
    } 

    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error getting tracked mods:`, error);
        return null;
    }
}

const _setCachedICCCNotifsChannel = (val) => cachedICCCNotifsChannel = val;
const _setCachedICCCModData = (val) => cachedModData = val;

module.exports = { 
     getLatestICCCModRelease,
     getLatestModData,
     getModData,
     getAllModsFromSpecificUser,
     _setCachedICCCNotifsChannel,
     _setCachedICCCModData
};