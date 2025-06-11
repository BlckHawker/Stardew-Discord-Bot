const fetch = require("node-fetch");
jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");
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

const twitch = require("../apiCalls/twitch");

const setupConsoleErrorMock = () => {
  return jest.spyOn(console, "error").mockImplementation(() => {});
};

const setUpConsoleLogMock = () => {
    return jest.spyOn(console, "log").mockImplementation(() => {});
}

const mockToken = {
      access_token: "abc123",
      expires_in: 3600,
      token_type: "bearer",
    };

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
    let consoleLogSpy;
    let consoleErrorSpy;
    const mockStream = {
      data: [{ id: '1234', title: 'Stream Title', tags: [], game_name: 'Some Game' }]
    };
    beforeEach(() => {
        jest.restoreAllMocks();
        fetch.mockReset();
        twitch._setCachedTwitchTokenObject(null);
        consoleLogSpy = setUpConsoleLogMock();
        consoleErrorSpy = setupConsoleErrorMock();

    })

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

  test("Uses cached token if still valid", async  () => {
    const futureTime = Date.now() + 10 * 60 * 1000;
    twitch._setCachedTwitchTokenObject({
      access_token: 'valid-token',
      expirationTime: futureTime
    });

    fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockStream), { status: 200 }));

    const result = await twitch.getStream();

    expect(result).toEqual(mockStream.data[0]);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[MOCKED_TIMESTAMP] Current time is more than 5 minutes before expiration time. Using cached token"
    );

  })
  test("Refreshes token when expired", async () => {

    twitch._setCachedTwitchTokenObject(({
      access_token: 'valid-token',
      expirationTime: 0
    }));

    jest.spyOn(twitch, "getTwitchTokenObject").mockResolvedValueOnce({
      access_token: "abc123",
      expirationTime: Date.now() + 10 * 60 * 1000,
      token_type: "bearer",
    });

    fetch.mockResolvedValue({
        status: 200,
        json: async () => mockStream,
    });


    const result = await twitch.getStream();

    expect(result).toEqual(mockStream.data[0]);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[MOCKED_TIMESTAMP] Current time is less than 5 minutes before expiration time. Getting new token"
    );
  })

  //todo Returns valid stream object
  //todo 
  describe("Handles Errors", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        fetch.mockReset();
        twitch._setCachedTwitchTokenObject(null);
        consoleLogSpy = setUpConsoleLogMock();
        consoleErrorSpy = setupConsoleErrorMock();

    })

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
    test("cachedTwitchTokenObject is null", async () => {
        jest.spyOn(twitch, "getTwitchTokenObject").mockResolvedValueOnce(null);
        fetch.mockResolvedValueOnce(new Response(JSON.stringify(null), {
            status: 200,
        }))

        fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockToken), {
            status: 200,
        }))

        const result = await twitch.getStream();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[MOCKED_TIMESTAMP] Error getting twitch token object. Terminating getting stream"
        );
        expect(result).toBeNull()

    })

    test("response is unsuccessful", async () => {
        twitch._setCachedTwitchTokenObject(mockToken)
        fetch.mockResolvedValueOnce(new Response(JSON.stringify(null), {
            status: 400,
            statusText: "Mock Error"
        }));

        const result = await twitch.getStream();

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[MOCKED_TIMESTAMP] Error getting latest twitch stream. Status 400 Mock Error"
        );
        

    })
    test("stream data length is 0", async () => {
        twitch._setCachedTwitchTokenObject(mockToken)
        fetch.mockResolvedValueOnce(new Response(JSON.stringify({data: []}), {
            status: 200,
        }));

        const result = await twitch.getStream();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[MOCKED_TIMESTAMP] Could not find live Hawker stream"
        );


    })
  })
  
});

describe("getTwitchTokenObject", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    fetch.mockReset();
  });

  test("Returns parsed token object with expirationTime", async () => {
    

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify(mockToken), {
        status: 200,
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
  test("stardew role is pinged if true", () => {
    const results = twitch.getCorrectRole(true)
    expect(results).toEqual(process.env.TWITCH_STARDEW_STREAM_ROLE)
  })
    test("other role is pinged if false", () => {
    const results = twitch.getCorrectRole(false)
    expect(results).toEqual(process.env.TWITCH_OTHER_STREAM_ROLE)
  })
});
