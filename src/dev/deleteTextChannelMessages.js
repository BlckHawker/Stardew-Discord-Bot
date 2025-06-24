require("dotenv").config();
const { ChannelType } = require('discord.js');
const utils = require("../utils.js");

const channelId = process.env.ICCC_NEXUS_MOD_NOTIFS_ID; // the id of the discord channel where all messages will be deleted 
(async () => {
    console.log("Delete script ran");
  
    const client = utils.createClient([], []);
    await client.login(process.env.DISCORD_TOKEN);
  
    //Don't move past this point in the async function until the bot is ready.
    await new Promise((resolve) => {
      client.once("ready", async () => {
        // Delete all messages in the specified channel
        await deleteAllMessagesInChannel(client, channelId);
        resolve(); //says Promise is finished
      });
    });
  
    //clean up once the program is finished
    await client.destroy();
    process.exit(0);
  })();


/**
 * Deletes all messages in a given Discord text channel.
 * @param {Client} client - Your Discord.js client instance.
 * @param {string} channelId - The ID of the text channel.
 */
async function deleteAllMessagesInChannel(client, channelId) {
  try {
    console.log("Deleting all messages in channel: ", channelId);
    const channel = await client.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      console.error('Provided channel ID is not a valid text channel.');
      return;
    }

    let messages;
    let foundMessages;
    //while there are still messages in the channel, fetch and delete them in batches of 100
    do {
      messages = await channel.messages.fetch({ limit: 100 });
      foundMessages = messages.size > 0;
      if(foundMessages)
        channel.bulkDelete(messages);
    } while (foundMessages);

    console.log('Finished deleting all messages.');
  } catch (error) {
    console.error('Error deleting messages:', error);
  }
}
