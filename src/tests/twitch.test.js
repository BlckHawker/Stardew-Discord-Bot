
const fetch = require("node-fetch");
jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");
const MOCK_TIMESTAMP = "MOCKED_TIMESTAMP"
jest.mock("../utils", () => ({
  getTimeStamp: jest.fn(() => MOCK_TIMESTAMP),
  convertIsoToDiscordTimestamp: jest.fn(() => `DISCORD_TIMESTAMP()`),
  convertUnixTimestampToReadableTimestamp: jest.fn(() => 'READABLE'),
}));
jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"));

const utils = require("../utils");

jest.mock("../apiCalls/discordCalls")
const discord = require("../apiCalls/discordCalls")

const twitch = require("../apiCalls/twitch");

const setupConsoleSpies = () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  return { consoleErrorSpy, consoleLogSpy };
};

const restoreConsoleSpies = (...spies) => spies.forEach(spy => spy.mockRestore());

const createMockStreamData = (overrides = {}) => ({
  id: '1234',
  title: 'Stream Title',
  tags: [],
  game_name: 'Some Game',
  user_login: 'user_login',
  ...overrides,
});

const createMockStream = (overrides = {}) => ({
  data: [createMockStreamData(overrides)],
});

const createMockToken = (overrides = {}) => ({
  access_token: 'abc123',
  expires_in: 3600,
  token_type: 'bearer',
  expirationTime: Date.now() + 10 * 60 * 1000, // 10 min in future by default
  ...overrides,
});

const mockFetchResponse = (data, options = {}) =>  {
  const defaultOptions = {
    status: 200,
    ...options,
  };
  return fetch.mockResolvedValueOnce(new Response(JSON.stringify(data), defaultOptions));
}

const mockToken = createMockToken();
const mockStreamData = createMockStreamData();
const mockStream = createMockStream();

const setupValidTokenAndStreamFetch = () => {
  twitch._setCachedTwitchTokenObject(mockToken);
  mockFetchResponse(mockStream)
};


beforeAll(() => {
  Object.assign(process.env, {
    TWITCH_CLIENT_ID: "test-client-id",
    TWITCH_CLIENT_SECRET: "test-secret",
    TWITCH_USER_ID: "hawker-id",
    STREAM_NOTIFS_CHANNEL_ID: "channel-id",
    TWITCH_STARDEW_STREAM_ROLE: "stardew-role-id",
    TWITCH_OTHER_STREAM_ROLE: "other-role-id",
  });
});

describe("sendLatestStreamMessage", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
        jest.restoreAllMocks();
        ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());
        
    })

    afterEach(() => {
        restoreConsoleSpies(consoleErrorSpy, consoleLogSpy)
        twitch._setCachedStreamObject(null)
        twitch._setCachedNotifsChannel(null)
    });

  

  test("Doesn't resend message if it's already cached", async () => {

     const expectedMessageContent = `<@&${twitch.getCorrectRole()}>\nHawker is live on twitch!\nStarted streaming at ${utils.convertIsoToDiscordTimestamp()}\nTitle: **${mockStreamData.title}**\nWatch here: https://www.twitch.tv/${mockStreamData.user_login}`;

    const notifsChannel = {name: "channel name", id: "id" }
    twitch._setCachedNotifsChannel(notifsChannel)
    jest.spyOn(twitch, "getStream").mockResolvedValueOnce(mockStreamData);
    jest.spyOn(twitch, "getCorrectRole").mockReturnValueOnce("role")
    discord.getDiscordChannel.mockResolvedValue(notifsChannel)
    discord.getDiscordMessages.mockResolvedValueOnce([{content: expectedMessageContent}])
    setupValidTokenAndStreamFetch();

    await twitch.sendLatestStreamMessage()
    expect(consoleLogSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Stream (id ${mockStreamData.id}) has already been announced in #${notifsChannel.name} at READABLE. Terminating sending stream notification`
    );    
  })

  describe("failure cases", () => {
    test.each([
      [
        "stream object not found",
        async () => {
          jest.spyOn(twitch, "getStream").mockResolvedValueOnce(null);
          twitch._setCachedTwitchTokenObject(mockToken);
          mockFetchResponse({ data: [] })
        },
        `[${MOCK_TIMESTAMP}] Could not find live Hawker stream. Unable to send twitch message`,
      ],
      [
        "notification channel cannot be found",
        async () => {
          setupValidTokenAndStreamFetch();
          jest.spyOn(discord, "getDiscordChannel").mockResolvedValueOnce(null);
        },
        `[${MOCK_TIMESTAMP}] There was an error getting stream notifs channel. Terminating sending message`,
      ],
    ])("%s", async (_, setup, expectedError) => {
      await setup();
      await twitch.sendLatestStreamMessage();
      expect(console.error).toHaveBeenCalledWith(expectedError);
    });
  });
});

describe("isStardewRelated", () => {
    describe("true cases", () => {
      const cases = [
      ["title contains 'stardew'", { title: "stardew" }],
      ["tags contains 'stardew'", { tags: ["stardew"] }],
      ["game_name is 'Stardew Valley'", { game_name: "Stardew Valley" }],
    ];

    test.each(cases)("returns true if %s", (_, overrides) => {
      const result = twitch.isStardewRelated(createMockStreamData(overrides));
      expect(result).toBeTruthy();
    });

    })

    test("returns false if no matching data", () => {
      const result = twitch.isStardewRelated(createMockStreamData());
      expect(result).toBeFalsy();
    });
});

describe("getStream", () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.restoreAllMocks();
        fetch.mockReset();
        twitch._setCachedTwitchTokenObject(null);
        ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());
    })

    afterEach(() => {
        restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
    });

  test("Uses cached token if still valid", async  () => {
    const futureTime = Date.now() + 10 * 60 * 1000;

    twitch._setCachedTwitchTokenObject(
      createMockToken({
      access_token: 'valid-token',
      expirationTime: futureTime
    }));

    mockFetchResponse(mockStream)

    const result = await twitch.getStream();

    expect(result).toEqual(mockStreamData);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[${MOCK_TIMESTAMP}] Current time is more than 5 minutes before expiration time. Using cached token`
    );

  })
  test("Refreshes token when expired", async () => {

    twitch._setCachedTwitchTokenObject(
      createMockToken({
      access_token: 'valid-token',
      expirationTime: 0
    }));

    jest.spyOn(twitch, "getTwitchTokenObject").mockResolvedValueOnce(
      createMockToken({expirationTime: Date.now() + 10 * 60 * 1000})
    );

    fetch.mockResolvedValue({
        status: 200,
        json: async () => mockStream,
    });

    const result = await twitch.getStream();

    expect(result).toEqual(mockStreamData);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[${MOCK_TIMESTAMP}] Current time is less than 5 minutes before expiration time. Getting new token`
    );
  })

  test("Returns valid stream object", async () => {
    twitch._setCachedTwitchTokenObject(mockToken);
    fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockStream,
    });

    const result = await twitch.getStream();

    expect(result).toEqual(mockStreamData);

    expect(consoleLogSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Successfully got stream data`
    );

  })

  describe("Handles Errors", () => {
    beforeEach(() => {
        fetch.mockReset();
        twitch._setCachedTwitchTokenObject(null);
        ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());

    })

    afterEach(() => {
        restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
    });
    test("cachedTwitchTokenObject is null", async () => {
        jest.spyOn(twitch, "getTwitchTokenObject").mockResolvedValueOnce(null);
        mockFetchResponse(null, 200)
        mockFetchResponse(mockToken, 200)
        const result = await twitch.getStream();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Error getting twitch token object. Terminating getting stream`
        );
        expect(result).toBeNull()

    })

    test("response is unsuccessful", async () => {
        twitch._setCachedTwitchTokenObject(mockToken)
        mockFetchResponse(null, {
            status: 400,
            statusText: "Mock Error"
        })

        const result = await twitch.getStream();

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Error getting latest twitch stream. Status 400 Mock Error`
        );
    })
    test("stream data length is 0", async () => {
        twitch._setCachedTwitchTokenObject(mockToken)
        mockFetchResponse({data: []})
        const result = await twitch.getStream();
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Could not find live Hawker stream`
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
    mockFetchResponse(mockToken)
    const result = await twitch.getTwitchTokenObject();
    expect(result).toHaveProperty("access_token", "abc123");
    expect(result).toHaveProperty("expirationTime");
    expect(result.expirationTime).toBeGreaterThan(Date.now());
  });

  describe("error cases", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    ({ consoleErrorSpy } = setupConsoleSpies());
  });

  afterEach(() => {
    restoreConsoleSpies()
  });

    test.each([
      [
        "response is unsuccessful",
        new Response(JSON.stringify(""), {
          status: 400,
          statusText: "statusText",
          headers: { "Content-Type": "application/json" },
        }),
        `[${MOCK_TIMESTAMP}] Error getting twitch token. Status 400 statusText`,
      ],
      [
        "twitchTokenObject json is falsy",
        new Response(JSON.stringify(null), {
          status: 200,
          statusText: "statusText",
          headers: { "Content-Type": "application/json" },
        }),
        `[${MOCK_TIMESTAMP}] Error parsing twitch token object. Object came as null`,
      ],
    ])("%s", async (_, mockResponse, expectedError) => {
      fetch.mockResolvedValueOnce(mockResponse);
      const result = await twitch.getTwitchTokenObject();
      expect(consoleErrorSpy).toHaveBeenCalledWith(expectedError);
      expect(result).toBeNull();
    });
  });
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
