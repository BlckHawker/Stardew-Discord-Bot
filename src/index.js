require("dotenv").config();
const Discord = require('discord.js');
const utils = require("./utils.js");
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

// most of the events were found here 
// https://gist.github.com/Iliannnn/f4985563833e2538b1b96a8cb89d72bb

//todo test
//Emitted whenever permissions for an application command in a guild were updated
// This includes permission updates for other applications in addition to the logged in client, check "data.applicationId" to verify which application the update is for
client.on('applicationCommandPermissionsUpdate', (request) => {
    console.log(`applicationCommandPermissionsUpdate: ${request}`);
});

//todo test
// Emitted before every API request. This event can emit several times for the same request, e.g. when hitting a rate limit.
client.on('apiRequest', (request) => {
    console.log(`apiRequest: ${request}`);
});

//todo test
// Emitted whenever a guild channel is created.
client.on('channelCreate', (channel) => {
    console.log(`channelCreate: ${channel}`);
});

//todo test
// Emitted whenever a channel is deleted.
client.on('channelDelete', (channel) => {
    console.log(`channelDelete: ${channel}`);
});

//todo test
// Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket event, not much information can be provided easily here - you need to manually check the pins yourself.
client.on('channelPinsUpdate', (channel, time) => {
    console.log(`channelPinsUpdate: ${channel} | ${time}`);
});

//todo test
// Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
client.on('channelUpdate', (oldChannel, newChannel) => {
    console.log(`channelUpdate: ${oldChannel} | ${newChannel}`);
});

//todo test
// Emitted for general debugging information.
client.on('debug', (info) => {
    console.log(`debug: ${info}`);
});

//todo test
// Emitted whenever a custom emoji is created in a guild.
client.on('emojiCreate', (emoji) => {
    console.log(`emojiCreate: ${emoji}`);
});

//todo test
// Emitted whenever a custom emoji is deleted in a guild.
client.on('emojiDelete', (emoji) => {
    console.log(`emojiDelete: ${emoji}`);
});

//todo test
// Emitted whenever a custom emoji is updated in a guild.
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    console.log(`emojiUpdate: ${oldEmoji} | ${newEmoji}`);
});

//todo test
// Emitted when the client encounters an error.
client.on('error', (error) => {
    console.log(`error: ${error}`);
});

//todo test
// Emitted whenever a member is banned from a guild.
client.on('guildBanAdd', (ban) => {
    console.log(`guildBanAdd: ${ban}`);
});

//todo test
// Emitted whenever a member is unbanned from a guild.
client.on('guildBanRemove', (ban) => {
    console.log(`guildBanRemove: ${ban}`);
});

//todo test
// Emitted whenever the client joins a guild.
client.on('guildCreate', (guild) => {
    console.log(`guildCreate: ${guild}`);
});

//todo test
// Emitted whenever a guild kicks the client or the guild is deleted/left.
client.on('guildDelete', (guild) => {
    console.log(`guildDelete: ${guild}`);
});

//todo test
// Emitted whenever a guild integration is updated.
client.on('guildIntegrationsUpdate', (guild) => {
    console.log(`guildIntegrationsUpdate: ${guild}`);
});

//todo test
// Emitted whenever a user joins a guild.
client.on('guildMemberAdd', (member) => {
    console.log(`guildMemberAdd: ${member}`);
});

//todo test
// Emitted whenever a member becomes available in a large guild.
//todo document how big the server needs to be to be considered "large"
//todo verify "available" means the member becomes online
client.on('guildMemberAvailable', (member) => {
    console.log(`guildMemberAvailable: ${member}`);
});

//todo test
// Emitted whenever a member leaves a guild, or is kicked.
client.on('guildMemberRemove', (member) => {
    console.log(`guildMemberRemove: ${member}`);
});

//todo test
// Emitted whenever a chunk of guild members is received (all members come from the same guild).
client.on('guildMembersChunk', (members, guild, chunk) => {
    console.log(`guildMemberRemove: ${members} | ${guild} | ${chunk}`);
});

//todo test
// Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
//todo make this more detailed to say what specifically was updated
client.on('guildMemberUpdate', (oldMember, newMember) => {
    console.log(`guildMemberUpdate: ${oldMember} | ${newMember}`);
});

//todo test
// Emitted whenever a guild scheduled event is created.
client.on('guildScheduledEventCreate', (guild) => {
    console.log(`guildScheduledEventCreate: ${guildScheduledEvent}`);
});

//todo test
// Emitted whenever a guild scheduled event is deleted.
client.on('guildScheduledEventDelete', (guild) => {
    console.log(`guildScheduledEventDelete: ${guildScheduledEvent}`);
});

//todo test
// Emitted whenever a guild scheduled event gets updated.
client.on('guildScheduledEventUpdate', (guild) => {
    console.log(`guildScheduledEventUpdate: ${oldGuildScheduledEvent} | ${newGuildScheduledEvent}`);
});

//todo test
// Emitted whenever a user subscribes to a guild scheduled event
client.on('guildScheduledEventUserAdd', (guild) => {
    console.log(`guildScheduledEventUserAdd: ${guildScheduledEvent} | ${user}`);
});

//todo test
// Emitted whenever a user unsubscribes from a guild scheduled event
client.on('guildScheduledEventUserRemove', (guild) => {
    console.log(`guildScheduledEventUserRemove: ${guildScheduledEvent} | ${user}`);
});

//todo test
// Emitted whenever a guild becomes unavailable, likely due to a server outage.
client.on('guildUnavailable', (guild) => {
    console.log(`guildUnavailable: ${guild}`);
});

//todo test
// Emitted whenever a guild is updated - e.g. name change.
client.on('guildUpdate', (oldGuild, newGuild) => {
    console.log(`guildUpdate: ${oldGuild} | ${newGuild}`);
});

//todo test
// Emitted when an interaction is created.
client.on('interactionCreate', (interaction) => {
    console.log(`interactionCreate: ${interaction}`);
});

//todo test
// Emitted when the client's session becomes invalidated. You are expected to handle closing the process gracefully and preventing a boot loop if you are listening to this event.
client.on('invalidated', () => {
    console.log(`invalidated`);
});

//todo test
// Emitted periodically when the process sends invalid requests to let users avoid the 10k invalid requests in 10 minutes threshold that causes a ban.
client.on('invalidRequestWarning', (invalidRequestWarningData) => {
    console.log(`invalidRequestWarning: ${invalidRequestWarningData}`);
})

//todo test
// Emitted when an invite is created.
//This event only triggers if the client has "MANAGE_GUILD" permissions for the guild, or "MANAGE_CHANNELS" permissions for the channel.
client.on('inviteCreate', (invite) => {
    console.log(`inviteCreate: ${invite}`);
});

//todo test
// Emitted when an invite is deleted.
//This event only triggers if the client has "MANAGE_GUILD" permissions for the guild, or "MANAGE_CHANNELS" permissions for the channel.
client.on('inviteDelete', (invite) => {
    console.log(`inviteDelete: ${invite}`);
});

// Emitted when a message is created
client.on('messageCreate', (message) => {
    if(message.author.id == process.env.CLIENT_ID)
        return;

    let content;
    if(!message.guild)
    {
        content = `${message.author.username} sent a message in dms saying "${message.content}"`;
        utils.sendDM(client, content, message.author.id);
    }

    else
    {
        content = `${message.author.username} sent a message in <#${message.channelId}> saying "${message.content}"`;
        utils.sendServerMessage(client, content);
    }
});

// Emitted whenever a message is deleted.
client.on('messageDelete', (message) => {
    console.log(message);
    utils.sendServerMessage(client, `A message by ${message.author.username} was deleted in <#${message.channelId}>`)
});

//todo test
// Emitted whenever messages are deleted in bulk.
client.on('messageDeleteBulk', (messages) => {
    console.log(`messageDeleteBulk: ${messages}`);
});

//todo test
// Emitted whenever a reaction is added to a cached message.
client.on('messageReactionAdd', (reaction, user) => {
    console.log(`messageReactionAdd: ${reaction} | ${user}`);
});

//todo test
// Emitted whenever a reaction is removed from a cached message.
client.on('messageReactionRemove', (reaction, user) => {
    console.log(`messageReactionRemove: ${reaction} | ${user}`);
});

//todo test
// Emitted whenever all reactions are removed from a cached message.
client.on('messageReactionRemoveAll', (message, reactions) => {
    console.log(`messageReactionRemoveAll: ${message} | ${reactions}`);
});

//todo test
// Emitted when a bot removes an emoji reaction from a cached message.
client.on('messageReactionRemoveEmoji', (reaction) => {
    console.log(`messageReactionRemoveEmoji: ${reaction}`);
});

//todo test
// Emitted whenever a message is updated - e.g. embed or content change.
client.on('messageUpdate', (oldMessage, newMessage) => {
    console.log(`messageUpdate: ${oldMessage} | ${newMessage}`);
});

// Emitted whenever a guild member's presence (e.g. status, activity) is changed.
client.on('presenceUpdate', (oldPresence, newPresence) => {
    if(true)
        return;
    let oldPresenceAvailable = oldPresence !== null;

    const oldClientStatusDesktop = oldPresenceAvailable ? oldPresence.clientStatus.desktop : undefined;
    const oldClientStatusMobile = oldPresenceAvailable ? oldPresence.clientStatus.mobile : undefined;

    const newClientStatusDesktop = newPresence.clientStatus.desktop; 
    const newClientStatusMobile = newPresence.clientStatus.mobile; 

    function logClientStatusChange(newPresence, oldPresence, platform, oldStatus, newStatus) {
        if (oldStatus !== newStatus) {
            const content = `${newPresence.user.username} is now ${newStatus ?? 'offline'} on ${platform}${oldPresence ? ` (was ${oldStatus ?? 'offline'})` : ""}`;
            utils.sendServerMessage(client, content)
        }
    }
    logClientStatusChange(newPresence, oldPresence, 'desktop', oldClientStatusDesktop, newClientStatusDesktop);
    logClientStatusChange(newPresence, oldPresence, 'mobile', oldClientStatusMobile, newClientStatusMobile);
});

//todo test
// Emitted when the client hits a rate limit while making a request.
client.on('rateLimit', (rateLimitData) => {
    console.log(`rateLimit: ${rateLimitData}`);
});

//todo test
// When the bot first initializes
client.on("ready", (c) => {
    console.log(`${c.user.tag} is online`);
});

//todo test
// Emitted whenever a role is created.
client.on('roleCreate', (role) => {
    console.log(`roleCreate: ${role}`);
});

//todo test
// Emitted whenever a role is deleted.
client.on('roleDelete', (role) => {
    console.log(`roleDelete: ${role}`);
});

//todo test
// Emitted whenever a role is updated.
client.on('roleUpdate', (oldRole, newRole) => {
    console.log(`roleUpdate: ${oldRole} | ${newRole}`);
});

//todo test
// Emitted when a shard's WebSocket disconnects and will no longer reconnect.
client.on('shardDisconnect', (event, id) => {
    console.log(`shardDisconnect: ${event} | ${id}`);
});

//todo test
// Emitted whenever a shard's WebSocket encounters a connection error.
client.on('shardError', (error, shardId) => {
    console.log(`shardError: ${error} | ${shardId}`);
});

//todo test
// Emitted when a shard turns ready.
client.on('shardReady', (id, unavailableGuilds) => {
    console.log(`shardError: ${id} | ${unavailableGuilds}`);
});

//todo test
// Emitted when a shard is attempting to reconnect or re-identify.
client.on('shardReconnecting', (id) => {
    console.log(`shardReconnecting: ${id}`);
});

//todo test
// Emitted when a shard resumes successfully.
client.on('shardResume', (id, replayedEvents) => {
    console.log(`shardReconnecting: ${id} | ${replayedEvents}`);
});

//todo test
// Emitted whenever a stage instance is created.
client.on('stageInstanceCreate', (stageInstance) => {
    console.log(`stageInstanceCreate: ${stageInstance}`);
});

//todo test
// Emitted whenever a stage instance is deleted.
client.on('stageInstanceDelete', (stageInstance) => {
    console.log(`stageInstanceDelete: ${stageInstance}`);
});

//todo test
// Emitted whenever a stage instance gets updated - e.g. change in topic or privacy level.
client.on('stageInstanceUpdate', (oldStageInstance, newStageInstance) => {
    console.log(`stageInstanceUpdate: ${oldStageInstance} | ${newStageInstance}`);
});

//todo test
// Emitted whenever a custom sticker is created in a guild.
client.on('stickerCreate', (sticker) => {
    console.log(`stickerCreate: ${sticker}`);
});

//todo test
// Emitted whenever a custom sticker is deleted in a guild.
client.on('stickerDelete', (sticker) => {
    console.log(`stickerDelete: ${sticker}`);
});

//todo test
// Emitted whenever a custom sticker is deleted in a guild.
client.on('stickerUpdate', (oldSticker, newSticker) => {
    console.log(`stickerUpdate: ${oldSticker} | ${newSticker}`);
});

//todo test
// Emitted whenever a thread is created or when the client user is added to a thread.
client.on('threadCreate', (thread) => {
    console.log(`threadCreate: ${thread}`);
});

//todo test
// Emitted whenever a thread is created or when the client user is added to a thread.
client.on('threadDelete', (thread) => {
    console.log(`threadDelete: ${thread}`);
});

//todo test
// Emitted whenever the client user gains access to a text or news channel that contains threads
client.on('threadListSync', (threads) => {
    console.log(`threadListSync: ${threads}`);
});

//todo test
// Emitted whenever members are added or removed from a thread.
client.on('threadMembersUpdate', (oldMembers, newMembers) => {
    console.log(`threadMembersUpdate: ${addedMembers} | ${removedMembers}`);
});

//todo test
// Emitted whenever the client user's thread member is updated.
client.on('threadMemberUpdate', (oldMember, newMember) => {
    console.log(`threadMemberUpdate: ${oldMember} | ${newMember}`);
});

//todo test
// Emitted whenever a thread is updated - e.g. name change, archive state change, locked state change.
client.on('threadUpdate', (oldThread, newThread) => {
    console.log(`threadUpdate: ${oldThread} | ${newThread}`);
});

//todo test
// Emitted whenever a user starts typing in a channel.
client.on('typingStart', (typing) => {
    console.log(`typingStart: ${typing}`);
});

//todo test
// Emitted whenever a user's details (e.g. username) are changed.
// Triggered by the Discord gateway events "USER_UPDATE", "GUILD_MEMBER_UPDATE", and "PRESENCE_UPDATE".
client.on('userUpdate', (oldUser, newUser) => {
    console.log(`userUpdate: ${oldUser} | ${newUser}`);
});

//todo test
// Emitted whenever a member changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
client.on('voiceStateUpdate', (oldState, newState) => {
    console.log(`voiceStateUpdate: ${oldState} | ${newState}`);
});

//todo test
// Emitted for general warnings.
client.on('warn', (info) => {
    console.log(`warn: ${info}`);
});

//todo test
// Emitted whenever a channel has its webhooks changed.
client.on('webhookUpdate', (channel) => {
    console.log(`webhookUpdate: ${channel}`);
});

client.login(process.env.DISCORD_TOKEN);