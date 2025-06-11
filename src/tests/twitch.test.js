describe("sendLatestStreamMessage", () => {
    //todo Sends a stream message when stream is live and new

    //todo Doesn't resend message if it's already cached

    //todo Doesn't send message if stream isn’t live

    //todo Handles failure cases

        //todo stream object not found (18)

        //todo notification channel cannot be found (29)
})

describe("isStardewRelated", () => {
    //todo Returns true if:
        //todo the title
        // todo tags
        // todo game name match

    //todo return false title, tags, nor game name doesn't match
})

describe("getStream", () => {
    //todo Uses cached token if still valid

    //todo Refreshes token when expired

    //todo Returns valid stream object

    //todo Handles errors

        // todo cachedTwitchTokenObject is null (137)

        //todo response is unsuccessful (156)

        //todo stream data length is 0 (164)
})

describe("getTwitchTokenObject", () => {
    //todo Returns parsed token object with expirationTime

    //todo handles errors

        //todo response is unsuccessful (186)

        //todo twitchTokenObject is falsy (195)
})

describe("getCorrectRole", () => {
    //todo stardew role is pinged if true

    //todo other role is pinged if false
})