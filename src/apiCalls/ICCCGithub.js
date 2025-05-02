require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const cron = require('cron');
const Discord = require('discord.js');
const discordCalls = require("./discordCalls.js");

/**
 * Sends a message to a Discord channel when a new ICC beta release is available.
 * @param {Client} client - Discord.js client instance
 */
const getLatestICCCBetaRelease = async (client) => {

  console.log("Getting the latest ICC beta release...")
 

  

  const response = await fetchMostRecentRelease();
  

  //if the status is not 200, don't do anything
  if(response.status !== 200) {
    console.error("Error getting the latest ICC release")
    return;
  }

  //get the most recent release
  const mostRecentRelease = response.data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];

  //if the most release is a pre-release, don't do anything
  if(!mostRecentRelease.prerelease) {
      //todo log this to some sort of discord channel
      console.error(`Most recent release is not a pre-release (id: ${mostRecentRelease.id})`)
      return;
  }

  // if this release has already been made a message, don't do anything

    //check all of the messages within the "best-test-release-notifs" channel
    const notifsChannel = await discordCalls.getDiscordChannel(client, process.env.ICCC_BETA_TEST_RELEASE_NOTIFS_ID);
    
    
    const messages = await discordCalls.getDiscordMessages(notifsChannel, 100)
    .then(messages => {
      //todo make sure to only check the messages sent by this bot
      return messages.filter(m => m.author.id == process.env.CLIENT_ID).map(m => m.content);
    })

    //todo check if any of the messages contain the release id
    const regex = new RegExp(String.raw`A new beta test build \(id: \`${mostRecentRelease.id}\`\) has been released.+`, 'g')

  //Otherwise, send a message to the channel with the release information
  if(!isDuplicateRelease(messages, regex)) {
    //get the timestamp from a week from now to tell when the feedback will stop being collected
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timestamp = Math.floor(oneWeekFromNow.getTime() / 1000);


    const sentMessage = discordCalls.sendMessage(notifsChannel, `<@&${process.env.ICCC_BETA_TESTER_ROLE}> A new beta test build (id: \`${mostRecentRelease.id}\`) has been released. Feedback for this version will stop being collected <t:${timestamp}:R> in ${`<#${process.env.ICCC_BETA_TEST_CHANNEL_ID}>`}. Be sure to add the tag \`${mostRecentRelease.tag_name}\` in your message so developers know which version you're referring to.\n${mostRecentRelease.html_url}`);

    //send a message one week from now to remind people to stop giving feedback
    const seconds = oneWeekFromNow.getSeconds();
    const minutes = oneWeekFromNow.getMinutes();
    const hours = oneWeekFromNow.getHours();
    const day = oneWeekFromNow.getDate();
    const month = oneWeekFromNow.getMonth() + 1;
    const dayOfWeek = oneWeekFromNow.getDay();

    let scheduledMessage = getCronObject(`${seconds} ${minutes} ${hours} ${day} ${month} ${dayOfWeek}`, () => {
      sentMessage.reply(`<@&${process.env.ICCC_BETA_TESTER_ROLE}> Feedback for this build (id: \`${mostRecentRelease.id}\`) has stopped being collected. Thank you all who participated.`);
      console.log('cron message sent');
      this.stop(); // Stop the job after sending the message
    });
      
    // When you want to start it, use:
    scheduledMessage.start()
  }
}

const fetchMostRecentRelease = async () => {
  //Get the latest release from a GitHub repository using the Octokit library
  // https://github.com/octokit/core.js#readme
   const octokit = new Octokit({
     auth: process.env.GITHUB_TOKEN
   })

   //make a call to the GitHub API to get the latest release
   const response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
     owner: process.env.ICCC_OWNER,
     repo: process.env.ICCC_REPO_NAME,
     headers: {
       'X-GitHub-Api-Version': process.env.GITHUB_API_VERSION
     }
   })

   return response;
}

//Returns a CronJob that will run at a specific time
//action - the action to take when the job runs
//{string} cronTime - how often the time should run (in cron format)  
const getCronObject = (cronTime, action) => {
  return new cron.CronJob(cronTime, action)
} 

const isDuplicateRelease = (messages, regex) => {
  return messages.some(m => m.match(regex) !== null);
}




module.exports = { getLatestICCCBetaRelease, isDuplicateRelease, getCronObject };

