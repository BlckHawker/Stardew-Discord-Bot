require("dotenv").config();
const Discord = require('discord.js');
const ICCCGithub = require("./apiCalls/ICCCGithub.js");
const cron = require('cron');

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

    //every hour, check if there is a new ICC beta release
    const ICCCBetaTestReleaseJob = new cron.CronJob('0 */1 * * *', () => {
        ICCCGithub.getLatestICCCBetaRelease(client);
    });

    ICCCBetaTestReleaseJob.start();
});

client.login(process.env.DISCORD_TOKEN);

