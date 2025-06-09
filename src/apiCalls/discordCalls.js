const utils = require('../utils.js');
//Anything that is related to Discord.js will be in this file

//Gets at least 100 messages from a Discord channel
//  channel - the channel object to get messages from
// {number} number - the number of messages to get (default is 100)
const getDiscordMessages = async (channel, number = 100) => {
  return await channel.messages.fetch({ limit: number });
};

//Gets a Discord channel object
// client - the Discord client object
// channelId - the ID of the channel to get
const getDiscordChannel = async (client, channelId) => {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`[${utils.getTimeStamp()}] Channel with ID ${channelId} could not be found.`);
      return null;
    }

    console.log(`[${utils.getTimeStamp()}] Channel with ID ${channelId} found (#${channel.name}).`);
    return channel;
  } 
  catch (error) {
    console.error(`[${utils.getTimeStamp()}] Error fetching channel ${channelId}:`, error);
    return null;
  }
};

//Sends a message to a Discord channel. Return the message object
// channel - the channel object to send the message to
// content - the content of the message to send
const sendMessage = async (channel, content) => {
  return await channel.send(content);
};

module.exports = { getDiscordMessages, getDiscordChannel, sendMessage };
