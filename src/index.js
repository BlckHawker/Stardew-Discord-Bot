require("dotenv").config();
const Discord = require('discord.js');
const ICCCGithub = require("./apiCalls/ICCCGithub.js");
const cron = require('cron');
const youtube = require("./apiCalls/youtube.js");
const twitch = require("./apiCalls/twitch.js")
const nexus = require("./apiCalls/nexus.js")




const { GatewayIntentBits, IntentsBitField, Partials } = Discord;

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.MessageContent,
        IntentsBitField.Flags.GuildMembers, 
        IntentsBitField.Flags.GuildMessages, 
        IntentsBitField.Flags.GuildPresences, 
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.MessageContent
    ],

    partials: [
        Partials.Channel,
        Partials.Message
    ]
})

// When the bot first initializes
client.on("ready", (c) => {
    console.log(`${c.user.tag} is online`);

    // every hour, check if there is a new ICC beta release on github
    const ICCCBetaTestReleaseJob = new cron.CronJob('0 */1 * * *', () => {
        ICCCGithub.getLatestICCCBetaRelease(client);
    });

    //every hour, check if a new youtube video release
    const youtubeRelease = new cron.CronJob('0 */1 * * *', () => {
        youtube.sendLatestVideoMessage(client);
    });

    // every hour, check if hawker is streaming on twitch
    const twitchJob = new cron.CronJob('0 */1 * * *', () => {
        twitch.sendLatestStreamMessage(client);
    });

    //every hour, heck if there is a new ICC release on nexus
    const ICCCReleaseJob = new cron.CronJob('0 */1 * * *', () => {
        nexus.getLatestICCCModRelease(client);
    });

    // every hour, check if there is a new mod released on Hawker's nexus account
    const nexusReleaseJob = new cron.CronJob('0 */1 * * *', () => {
        nexus.getAllModsFromSpecificUser(client);
    });

    ICCCBetaTestReleaseJob.start();
    youtubeRelease.start();
    twitchJob.start();
    ICCCReleaseJob.start();
    nexusReleaseJob.start();
});

client.login(process.env.DISCORD_TOKEN);

