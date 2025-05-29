//log all the channels the bot can view to in an a specific guild

const Discord = require('discord.js');
const { GatewayIntentBits, IntentsBitField, Partials } = Discord;
require("dotenv").config();
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
client.login(process.env.DISCORD_TOKEN);

const guidId = process.env.DISCORD_GUILD_ID; //id of the guild to check
const botId = process.env.CLIENT_ID; //id of the bot to check

(async () => {
    try {
        const guild = await client.guilds.fetch(guidId);
        const botMember = await guild.members.fetch(botId);

        // Fetch all channels in the guild
        const channels = await guild.channels.fetch();
        console.log(`\nChannels "${botMember.user.tag}" has ViewChannel permission in guild: ${guild.name}`);
        channels.forEach(channel => {
            // Check if bot has 'ViewChannel' permission
            const perms = channel.permissionsFor(botMember);
            if (perms?.has('ViewChannel')) {
                console.log(`✅ ${channel.name} (${channel.id}) [${channel.type}]`);
            } else {
                console.log(`❌ ${channel.name || '[Unnamed]'} (${channel.id}) [No access]`);
            }
        });
    } 
    catch (error) {
        console.log(`There was an error in viewAvailableChannels.js: ${error}`);
    }
})();