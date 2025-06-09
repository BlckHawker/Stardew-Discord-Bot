require("dotenv").config();
const fetch = require("node-fetch");
const discordCalls = require("./discordCalls.js");
const utils = require("../utils.js");

let latestStardewVideo = null; //variable to store the latest Stardew video
let latestStardewVideoMessage = null; //variable to store the discord message object that notifies when the latestStardewVideo ws uploaded to the discord channel
let latestNonStardewVideo = null; //variable to store the latest non-stardew youtube
let latestNonStardewVideoMessage = null; //variable to store the discord message object that notifies when the latestNonStardewVideo was uploaded to the discord channel

async function sendLatestVideoMessage(client) {
  console.log(`[${utils.getTimeStamp()}] Getting the latest YouTube video...`);

  const latestVideo = await getLatestYoutubeVideo();

  if (!latestVideo) {
    console.error(`[${utils.getTimeStamp()}] Couldn't load videos.`);
    return;
  }

  //the discord channel where the bot notifies about youtube uploads
  const notifsChannel = await discordCalls.getDiscordChannel(
    client,
    process.env.UPLOAD_NOTIFS_CHANNEL_ID
  );

  console.log(
    `[${utils.getTimeStamp()}] Latest video found: ${latestVideo.title} (id: ${
      latestVideo.videoId
    })`
  );

  //check if the video is Stardew related
  const isStardewRelated = isStardewRelatedVideo(latestVideo);

  //if the video is stardew related and "latestStardewVideo" is not null, check if the video is the same as the latest stardew video
  if (
    checkIfAlreadyNotified(
      isStardewRelated,
      latestStardewVideo,
      latestVideo,
      latestStardewVideoMessage,
      notifsChannel
    )
  ) {
    return;
  }

  //otherwise, if the video is not stardew related and "latestNonStardewVideo" is not null, check if the video is the same as the latest non-stardew video
  if (
    checkIfAlreadyNotified(
      !isStardewRelated,
      latestNonStardewVideo,
      latestVideo,
      latestNonStardewVideoMessage,
      notifsChannel
    )
  ) {
    return;
  }

  //check to see if there is already a message in the "upload-notifs" channel about this video

 
  //get the message content to send to the channel
  const messageContent = getMessageContent(isStardewRelated, latestVideo);

  //get the 100 most recent messages in the channel
  const messageObjects = await discordCalls.getDiscordMessages(notifsChannel, 100);

  //see if there any messages that match the message content
  const duplicateMessage = messageObjects.find((m) => m.content === messageContent);

  //if there is a duplicate message, save it in the correct VideoMessage variable
  if (duplicateMessage !== undefined) {
    if (isStardewRelated) {
      latestStardewVideoMessage = duplicateMessage;
      latestStardewVideo = latestVideo;
    } else {
      latestNonStardewVideoMessage = duplicateMessage;
      latestNonStardewVideo = latestVideo;
    }
    logAlreadySentMessage(notifsChannel, duplicateMessage);
    return;
  }

  //if there is no duplicate message, send the message to the channel
  console.log(
    `[${utils.getTimeStamp()}] Sending message to channel ${
      notifsChannel.name
    } for "${latestVideo.title}"...`
  );
  const sentMessage = await discordCalls.sendMessage(
    notifsChannel,
    messageContent
  );
  if (isStardewRelated) {
    latestStardewVideoMessage = sentMessage;
    latestStardewVideo = latestVideo;
  } else {
    latestNonStardewVideoMessage = sentMessage;
    latestNonStardewVideo = latestVideo;
  }
}

/* Helper function that returns the message content to notify the latest video.
    param isStardewRelated - true if the video is Stardew related, false otherwise
    param latestVideo - the latest video object that was uploaded
    returns the message content for the latest video
  */
const getMessageContent = (isStardewRelated, latestVideo) => {
   //figure out which role will be pinged based on whether the video is Stardew related
  const roleId = isStardewRelated
    ? process.env.STARDEW_UPLOADS_NOTIFS_ROLE
    : process.env.OTHER_UPLOADS_NOTIFS_ROLE;

    //make the message content
  const messageContent = `<@&${roleId}> Hawker uploaded **${
    latestVideo.title
  }** at ${utils.convertIsoToDiscordTimestamp(latestVideo.published)}\n${
    latestVideo.link
  }`;

  return messageContent;
}

/* Helper function that checks if the latest video has already been notified in the notifications channel.
    param isStardewRelated - true if the video is Stardew related, false otherwise
    param latestVideoRef - the reference to the latest video object that was notified in the notifications channel (null if the bot was just initialized)
    param currentVideo - the current video object that is being checked if a notification has already been sent
    param messageObject - the message object that was sent to the notifications channel
    param notifsChannel - the channel object where the notify message should be if found
    returns true if the video has already been notified, false otherwise
*/
const checkIfAlreadyNotified = (
  isStardewRelated,
  latestVideoRef,
  currentVideo,
  messageObject,
  notifsChannel
) => {
  // console.log("isStardewRelated: ", isStardewRelated)
  // console.log("latestVideoRef: ", latestVideoRef);
  // console.log("currentVideo: ", currentVideo);
  if (isStardewRelated && latestVideoRef !== null && latestVideoRef.videoId === currentVideo.videoId) {
    logAlreadySentMessage(notifsChannel, messageObject);
    return true;
  }
  return false;
};

/*Helper function that checks if the latest video is Stardew related.
    param video - the video object to check
    returns true if the video is Stardew related, false otherwise
*/
const isStardewRelatedVideo = (video) => {
  const keyword = "STARDEW";
  const timestamp = `[${utils.getTimeStamp()}]`;

  //the video is Stardew related if:
  //the title contains "Stardew" ignoring case
  if (video.title.toUpperCase().includes(keyword)) {
    console.log(
      `${timestamp} Latest video is Stardew related because of the title.`
    );
    return true;
  }
  //the description contains "Stardew" ignoring case
  if (video.description.toUpperCase().includes(keyword)) {
    console.log(
      `${timestamp} Latest video is Stardew related because of the description.`
    );
    return true;
  }

  //there is a tag containing "Stardew" ignoring case
  if (video.tags.some((tag) => tag.toUpperCase().includes(keyword))) {
    console.log(
      `${timestamp} Latest video is Stardew related because of there is a tag including the word "Stardew".`
    );
    return true;
  }

  //if none of the above conditions are met, the video is not Stardew related
  console.log(`${timestamp} Latest video is not Stardew related.`);
  return false;
};

/*
Helper function that says a message notify the release of a video has already been sent to the notifications channel.
    param notifsChannel - the channel object where the notify message was found
    param messageObject - the message object that already notifies of the latest video 
*/
const logAlreadySentMessage = (notifsChannel, messageObject) => {
  console.log(
    `[${utils.getTimeStamp()}] Latest video has already been posted to ${
      notifsChannel.name
    } channel at ${utils.convertUnixTimestampToReadableTimestamp(
      messageObject.createdTimestamp
    )}.`
  );
};

/**
 * Sends a message to a Discord channel when Hawker uploads a new YouTube video.
 * @param {Client} client - Discord.js client instance
 */
async function getLatestYoutubeVideo() {
  //get id of the most recent video
  const searchURL = new URL("https://www.googleapis.com/youtube/v3/search");
  searchURL.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  searchURL.searchParams.set("channelId", process.env.YOUTUBE_CHANNEL_ID);
  searchURL.searchParams.set("part", "snippet");
  searchURL.searchParams.set("order", "date");
  searchURL.searchParams.set("maxResults", "1");
  searchURL.searchParams.set("type", "video");

  const searchResponse = await fetch(searchURL);
  let searchData;
  try {
    searchData = await searchResponse.json();
  } catch (err) {
    console.error(
      `[${utils.getTimeStamp()}] Failed to parse JSON response from YouTube API:`,
      err
    );
    return null;
  }
  //verify the response is ok
  if (!searchResponse.ok) {
    console.error(
      `[${utils.getTimeStamp()}] Error fetching YouTube search data: ${
        searchData.error.message
      }`
    );
    return null;
  }

  //check to see if the channel as at least one video
  if (searchData.items.length === 0) {
    console.error(`[${utils.getTimeStamp()}] No videos found for the channel.`);
    return null;
  }

  const videoId = searchData.items[0].id.videoId;

  //Get meta data for video
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  videosUrl.searchParams.set("id", videoId);
  videosUrl.searchParams.set("part", "snippet");

  const videosResponse = await fetch(videosUrl);
  const videosData = await videosResponse.json();

  if (!videosResponse.ok) {
    console.error(
      `[${utils.getTimeStamp()}] Error fetching meta data for video with the id of ${videoId}: ${
        videosData.error.message
      }`
    );
    return null;
  }

  //verify that video data was caught
  if (videosData.items.length === 0) {
    console.error(
      `[${utils.getTimeStamp()}] No video data found for the video with the id of ${videoId}. Possible issues: The video may have been deleted, the video might private or restricted, or there may be an issue with the YouTube API.`
    );
    return null;
  }

  const video = videosData.items[0].snippet;

  return {
    videoId,
    title: video.title,
    description: video.description,
    published: video.publishedAt,
    tags: video.tags || [],
    link: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

module.exports = {
  sendLatestVideoMessage,
  logAlreadySentMessage,
  isStardewRelatedVideo,
  getLatestYoutubeVideo,
  checkIfAlreadyNotified,
  getMessageContent
};
