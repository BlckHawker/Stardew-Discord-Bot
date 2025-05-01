require("dotenv").config();

//Sends a message to a server channel
//client - the client object
//content - the content that will be sent
//id - the id of the channel
const sendServerMessage = (client, content, id = process.env.DEBUG_CHANNEL_ID) => {
    client.channels.cache.get(id).send(content);
}

//Sends a message to a person via dm
//client - the client object
//content - the content that will be sent
//id - the id of the person to send dms to
const sendDM = (client, content, id) => {
    client.users.send(id, content);
}

module.exports = { sendServerMessage, sendDM };