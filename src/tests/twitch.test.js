const fetch = require("node-fetch");
jest.mock("node-fetch");

jest.mock("../utils", () => ({
  getTimeStamp: jest.fn(() => "MOCKED_TIMESTAMP"),
  convertIsoToDiscordTimestamp: jest.fn((iso) => `DISCORD_TIMESTAMP(${iso})`),
  convertUnixTimestampToReadableTimestamp: jest.fn((ts) => `READABLE(${ts})`),
}));

jest.mock("../apiCalls/discordCalls", () => ({
  getDiscordChannel: jest.fn(),
  getDiscordMessages: jest.fn(),
  sendMessage: jest.fn(),
}));

const setupConsoleErrorMock = () => {
  return jest.spyOn(console, "error").mockImplementation(() => {});
};

const twitch = require("../apiCalls/twitch");

process.env = {
  TWITCH_CLIENT_ID: "test-client-id",
  TWITCH_CLIENT_SECRET: "test-secret",
  TWITCH_USER_ID: "hawker-id",
  STREAM_NOTIFS_CHANNEL_ID: "channel-id",
  TWITCH_STARDEW_STREAM_ROLE: "stardew-role-id",
  TWITCH_OTHER_STREAM_ROLE: "other-role-id",
};

describe("sendLatestStreamMessage", () => {
  //todo Sends a stream message when stream is live and new
  //todo Doesn't resend message if it's already cached
  //todo Doesn't send message if stream isn’t live
  //todo Handles failure cases
  //todo stream object not found (18)
  //todo notification channel cannot be found (29)
});

describe("isStardewRelated", () => {

    test("returns true if title contains \"Stardew\"", () => {
        const result = twitch.isStardewRelated({title: "stardew"})
        expect(result).toBeTruthy()
    }) 

    test("returns true if there is at least one tag that contains \"Stardew\"", () => {
        const result = twitch.isStardewRelated({title: "", tags: ["stardew"]})
        expect(result).toBeTruthy()
    })
    
    test("returns true if game name is \"Stardew Valley\"", () => {
        const result = twitch.isStardewRelated({title: "", tags: [], game_name: "Stardew Valley"})
        expect(result).toBeTruthy()
    })
    
    test("return false if  title, tags, nor game name doesn't match \"Stardew Valley\"", () => {
        const result = twitch.isStardewRelated({title: "", tags: [], game_name: ""})
        expect(result).toBeFalsy()
    })


});

describe("getStream", () => {
  //todo Uses cached token if still valid
  //todo Refreshes token when expired
  //todo Returns valid stream object
  //todo Handles errors
  // todo cachedTwitchTokenObject is null (137)
  //todo response is unsuccessful (156)
  //todo stream data length is 0 (164)
});

describe("getTwitchTokenObject", () => {
  beforeEach(() => {
    fetch.mockReset();
  });

  test("Returns parsed token object with expirationTime", async () => {
    const mockResponse = {
      access_token: "abc123",
      expires_in: 3600,
      token_type: "bearer",
    };

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await twitch.getTwitchTokenObject();

    expect(result).toHaveProperty("access_token", "abc123");
    expect(result).toHaveProperty("expirationTime");
    expect(result.expirationTime).toBeGreaterThan(Date.now());
  });

  //handles errors
  describe("Handler Errors", () => {
    let consoleErrorSpy;
    beforeEach(() => {
        fetch.mockReset();
        consoleErrorSpy = setupConsoleErrorMock();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    //response is unsuccessful
    test("response is unsuccessful", async () => {

        fetch.mockResolvedValueOnce(
            new Response(JSON.stringify(""), {
                status: 400,
                statusText: "statusText",
                headers: { "Content-Type": "application/json" },
            })
        )

        const result = await twitch.getTwitchTokenObject();

        expect(consoleErrorSpy).toHaveBeenCalledWith("[MOCKED_TIMESTAMP] Error getting twitch token. Status 400 statusText");

        expect(result).toBeNull() 
    })


    //twitchTokenObject is falsy
    test("twitchTokenObject json is falsy", async () => {
        fetch.mockResolvedValueOnce(
            new Response(JSON.stringify(null), {
                status: 200,
                statusText: "statusText",
                headers: { "Content-Type": "application/json" },
            })
        )

        const result = await twitch.getTwitchTokenObject();

        expect(consoleErrorSpy).toHaveBeenCalledWith("[MOCKED_TIMESTAMP] Error parsing twitch token object. Object came as null");

        expect(result).toBeNull() 

    })
  })


});

describe("getCorrectRole", () => {
  //todo stardew role is pinged if true
  //todo other role is pinged if false
});
