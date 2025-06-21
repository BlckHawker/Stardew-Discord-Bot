require("dotenv").config();
const fetch = require("node-fetch");
const utils = require("../utils")
const discord = require("../apiCalls/discordCalls.js")
const baseUrl = "https://api.nexusmods.com"

let cachedNotifsChannel = null;
let cachedModData = null;

const getLatestICCCModRelease = async (client) => {
    const id = process.env.ICCC_NEXUS_MOD_ID
    try {
        //get ICCC Nexus mod data
        console.log(`[${utils.getTimeStamp()}] Getting latest nexus mod release of ICCC mod (id: ${id})...`)
        const modData = await getLatestModData(id)

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

    } catch (error) {
        //log error
        console.error(`[${utils.getTimeStamp()}] Error latest nexus mod release of ICCC.`, error)


    }
}

//Gets Nexus latest meta data for a specific mod given its mod id
const getLatestModData = async (id) => {
    try {
        console.log(`[${utils.getTimeStamp()}] Getting latest build Stardew nexus mod with id ${id}...`)
        const modData = await getModData(id);

        //if modData is null, return null
        if(modData === null) {
            console.error(`[${utils.getTimeStamp()}] Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`);
            return null;
        }

        //Otherwise extract the data so only the latest files are sent
        else {
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
                console.error(`[${utils.getTimeStamp()}] ${errorMessage}. There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`)
                return null;
            }

            console.log(`[${utils.getTimeStamp()}] Validated mod data...`)
            return mainFiles[0];
        }
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
        
        let response = await fetch(`${baseUrl}/v1/games/stardewvalley/mods/${id}/files.json`, {
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

module.exports = { 
     getLatestICCCModRelease
};