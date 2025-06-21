require("dotenv").config();
const fetch = require("node-fetch");
const utils = require("../utils")
const discord = require("../apiCalls/discordCalls.js")

let cachedNotifsChannel = null;
let cachedModData = null;

const getLatestICCCModRelease = async (client) => {
    const id = process.env.ICCC_NEXUS_MOD_ID
    try {
        //get ICCC Nexus mod data
        console.log(`[${utils.getTimeStamp()}] Getting latest nexus mod release of ICCC mod...`)
        debugger
        const modData = await module.exports.getLatestModData(id)

        //if there is an issue getting mod data, don't send message
        if(modData === null) {
            console.error(`[${utils.getTimeStamp()}] Unable to get ICCC Nexus mod data. Not sending message...`);
            return
        }

        //get the channel object to send the notification in
        if(cachedNotifsChannel === null) {
            console.log(`[${utils.getTimeStamp()}] Getting ICCC nexus release notifs channel...`)
            cachedNotifsChannel = await discord.getDiscordChannel(client, process.env.ICCC_NEXUS_MOD_NOTIFS_ID)

            //if there's a problem with getting the notifs channel, stop this method
            if(cachedNotifsChannel === null) {
                console.error(`[${utils.getTimeStamp()}] There was an error getting ICCC nexus notifs channel. Terminating sending message`)
                return;
            }

            console.log(`[${utils.getTimeStamp()}] ICCC nexus notifs channel gotten successfully`)
        }

        //skip fetching channel if already cached
        else {
            console.log(`[${utils.getTimeStamp()}] Notifis channel (#${cachedNotifsChannel.name}) already cached. Skipping fetch`);
        }

        //check to see if the mod data is the same as the cached one (if applicable)
        if(cachedModData === null) {
            console.log(`[${utils.getTimeStamp()}] No ICCC mod data cached. Sending announcement in #${cachedNotifsChannel.name}`)
        }

        else if(modData.uid === cachedModData.uid) {
            console.log(`[${utils.getTimeStamp()}] Cached ICCC mod data uid matches current ICCC mod data's (${cachedModData.uid}). No need to send duplicate announcement`)
            return;
        }

        else {
            console.log(`[${utils.getTimeStamp()}] Cached ICCC mod data uid (${cachedModData.uid}) does not match current ICCC mod data's (${modData.uid}). Sending announcement in #${cachedNotifsChannel.name}`)
        }

        //overwrite ICCC mod data
        cachedModData = modData;


        //create the message to send to the notifs channel
        const roleId = process.env.ICCC_ROLE;
        const messageContent = `<@&${roleId}>\nA version build of **${modData.name} (v${modData.version})** has been released at ${utils.convertIsoToDiscordTimestamp(modData.uploaded_time)}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`

        //check if the message has already been sent
        const oldNotifsMessages = await discord.getDiscordMessages(cachedNotifsChannel);
        
        const duplicateMessage = oldNotifsMessages.find(m => m.content === messageContent);

        if(duplicateMessage !== undefined) {
            console.log(`[${utils.getTimeStamp()}] Mod (uid ${modData.uid}) has already been announced in #${cachedNotifsChannel.name} at ${utils.convertUnixTimestampToReadableTimestamp(duplicateMessage.createdTimestamp)}. Terminating sending mod notification`)
            return;
        }

        //send message
        discord.sendMessage(cachedNotifsChannel, messageContent);

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

        //Otherwise extract the data so only the latest files are sent
        const errorMessage = `There was a problem reading mod data with id ${id}.`;

        //verify that there is a property called "files"
        if(!modData.files) {
            console.error(`[${utils.getTimeStamp()}] ${errorMessage} object did not have required "files" property.`);
            return null;
        }

        //verify that each object within "files" has a "category_name" property
        if(modData.files.length === 0 || modData.files.some(f => !f.category_name)) {
            console.error(`[${utils.getTimeStamp()}] ${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`);
            return null;
        }

        //verify each "category_name" property is either "OLD_VERSION" or "MAIN"
        if(modData.files.some(f => f.category_name !== "OLD_VERSION" && f.category_name !== "MAIN")) {
            const allCategoryNames = modData.files.map(f => `"${f.category_name}"`);
            console.error(`[${utils.getTimeStamp()}] ${errorMessage} At least one of the "category_name" properties is not "OLD_VERSION" nor "MAIN". Found ${allCategoryNames.join(", ")}.`);
            return null;
        }

        //verify there is exactly one "category_name" property with the value "MAIN"
        const mainFiles = modData.files.filter(f => f.category_name === "MAIN");

        if(mainFiles.length !== 1) {
            console.error(`[${utils.getTimeStamp()}] ${errorMessage} There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`)
            return null;
        }

        console.log(`[${utils.getTimeStamp()}] Validated mod data...`)
        return mainFiles[0];
    }

    catch (error) {
        console.error(`[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}:`, error);
        return null;
    }

}

//Gets Nexus meta data for a specific mod given its mod id
const getModData = async (id) => {
    try {
        console.log(`[${utils.getTimeStamp()}] Getting Stardew nexus mod with id ${id}...`)
        
        let response = await fetch(`https://api.nexusmods.com/v1/games/stardewvalley/mods/${id}/files.json`, {
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

const _setCachedNotifsChannel = (val) => cachedNotifsChannel = val;
const _setCachedModData = (val) => cachedModData = val;

module.exports = { 
     getLatestICCCModRelease,
     getLatestModData,
     getModData,
     _setCachedNotifsChannel,
     _setCachedModData
};