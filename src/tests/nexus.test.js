const fetch = require("node-fetch");
jest.mock("node-fetch");
const MOCK_TIMESTAMP = "MOCKED_TIMESTAMP"
const DISCORD_TIMESTAMP = "DISCORD_TIMESTAMP"
const READABLE_TIMESTAMP = "READABLE"


// Utils mocked globally (does not depend on nexus)
jest.mock("../utils", () => ({
  getTimeStamp: jest.fn(() => MOCK_TIMESTAMP),
  convertIsoToDiscordTimestamp: jest.fn(() => DISCORD_TIMESTAMP),
  convertUnixTimestampToReadableTimestamp: jest.fn(() => READABLE_TIMESTAMP),
}));

// discordCalls mocked globally so we can mock its functions later
jest.mock("../apiCalls/discordCalls");

//todo rewrite test descriptions so they're more insightful

const validModData = {
  uid: 123,
  name: "Test Mod",
  version: "1.0",
  uploaded_time: "2000-01-01T00:00:00Z",
  category_name: "MAIN",
};

const validDiscordChannel = { name: "test-channel" };

const mockFetchResponse = (data, options = {}) => {
  const defaultResponse = {
    status: 200,
    statusText: "OK",
    json: async () => data,
  };

  // Merge any options you want to override (e.g. status, statusText)
  const mockResponse = { ...defaultResponse, ...options };

  // Mock fetch to resolve to this object once
  return fetch.mockResolvedValueOnce(mockResponse);
};

beforeAll(() => {
  Object.assign(process.env, {
    ICCC_ROLE: "ICCC_ROLE",
    ICCC_NEXUS_MOD_ID: "ICCC_NEXUS_MOD_ID",
  });
});


const restoreConsoleSpies = (...spies) => spies.forEach(spy => spy.mockRestore());

describe("getLatestICCCModRelease", () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let nexus;
  let discord;

  beforeEach(() => {
    jest.resetModules();

    // Setup spies BEFORE importing tested modules
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Import modules AFTER spies are setup
    nexus = require("../apiCalls/nexus");
    discord = require("../apiCalls/discordCalls");

    // Clear cached data for each test
    nexus._setCachedNotifsChannel(null);
    nexus._setCachedModData(null);
  });

  afterEach(() => {
    restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
  });

  test("if there is a problem getting modData", async () => {
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
    await nexus.getLatestICCCModRelease();
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get ICCC Nexus mod data. Not sending message...`);
  });

  describe('if "cachedNotifsChannel" is null', () => {
    beforeEach(() => {
      // no resetModules here to keep spies & modules
      nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    });

    test("if there is a problem getting cachedNotifsChannel", async () => {
      discord.getDiscordChannel.mockResolvedValueOnce(null);
      await nexus.getLatestICCCModRelease({});
      expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting ICCC nexus notifs channel. Terminating sending message`);
    });

    test("cachedNotifsChannel was gotten successfully", async () => {
      discord.getDiscordChannel.mockResolvedValueOnce({ name: "test-channel" });
      await nexus.getLatestICCCModRelease({});
      expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] ICCC nexus notifs channel gotten successfully`);
    });
  });

  test("if cachedNotifsChannel is not null, no need to fetch it again", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`);
  });

  test("cachedModData is null", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] No ICCC mod data cached. Sending announcement in #${validDiscordChannel.name}`);
  });

  test("cachedModData is cached with duplicate data", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus._setCachedModData(validModData);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid matches current ICCC mod data's (${validModData.uid}). No need to send duplicate announcement`);
  });

  test("cachedModData is cached with different data", async () => {
    const newModData = {
      uid: 321,
      name: "Other Test Mod",
      version: "2.0",
      uploaded_time: "3000-01-01T00:00:00Z",
      category_name: "MAIN",
    };

    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus._setCachedModData(validModData);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(newModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid (${validModData.uid}) does not match current ICCC mod data's (${newModData.uid}). Sending announcement in #${validDiscordChannel.name}`);
  });

  test("if duplicate message is found, then don't send discord message", async () => {
    const expectedMessageContent = `<@&${process.env.ICCC_ROLE}>\nA version build of **${validModData.name} (v${validModData.version})** has been released at ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${process.env.ICCC_NEXUS_MOD_ID}`;
    consoleLogSpy(expectedMessageContent);  // <-- seems like a stray call? Might want to remove this

    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    discord.getDiscordMessages.mockResolvedValueOnce([{ content: expectedMessageContent }]);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`);
  });

  test("if duplicate message cannot be found, send discord message", async () => {
    discord.sendMessage = jest.fn(() => {});
    discord.getDiscordMessages = jest.fn(() => []);
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(discord.sendMessage).toHaveBeenCalledTimes(1);
  });

  test("Errors should be handled gracefully", async () => {
    let error = new Error("Test error");
    nexus.getLatestModData = jest.fn().mockRejectedValueOnce(error);
    await nexus.getLatestICCCModRelease({});
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error latest nexus mod release of ICCC"),
      error
    );
  });
});

describe("getLatestModData", () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let nexus;

  beforeEach(() => {
    jest.resetModules();

    // Setup spies BEFORE importing tested modules
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Import module AFTER spies are setup
    nexus = require("../apiCalls/nexus");
  });

  afterEach(() => {
    restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
  });

  test("modData is null", async () => {
    nexus.getModData = jest.fn().mockResolvedValueOnce(null);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Error getting latest build nexus Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}. Unable to extract data`);
    expect(result).toBeNull();
  });

  test("There isn't a property called \"files\"", async () => {
    const modData = {};
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. object did not have required "files" property.`);
    expect(result).toBeNull();
  });

  test("each object within \"files\" doesn't have a \"category_name\" property", async () => {
    const modData = { files: [{}] };
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. At least one of the object within the "files" property does not have "category_name" property.`);
    expect(result).toBeNull();
  });

  test("verify each \"category_name\" property is not either \"OLD_VERSION\" or \"MAIN\"", async () => {
    const modData = { files: [{ category_name: "OLD_VERSION" }, { category_name: "not valid" }] };
    const allCategoryNames = modData.files.map(f => `"${f.category_name}"`);
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. At least one of the "category_name" properties is not "OLD_VERSION" nor "MAIN". Found ${allCategoryNames.join(", ")}.`);
    expect(result).toBeNull();
  });

  test("verify there is not exactly one \"category_name\" property with the value \"MAIN\"", async () => {
    const modData = { files: [{ category_name: "MAIN" }, { category_name: "MAIN" }] };
    const mainFiles = modData.files.filter(f => f.category_name === "MAIN");
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`);
    expect(result).toBeNull();
  });

  test("Errors are handled gracefully", async () => {
    let error = new Error("Test error");
    nexus.getModData = jest.fn().mockRejectedValueOnce(error);
    await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Error getting latest build nexus Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}:`),
      error
    );
  });
});

describe("getModData", () => {
    let nexus;
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        // Setup spies BEFORE importing tested modules
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        // Import module AFTER spies are setup
        nexus = require("../apiCalls/nexus");
    });

    afterEach(() => {
        restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
    });

    test("response does not have a status that starts with a 2", async () => {

        mockFetchResponse(null, {
        status: 400,
        statusText: "Mock Error",
    })
    // mock fetch to return a response object with status 400

    const result = await nexus.getModData(process.env.ICCC_NEXUS_MOD_ID);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Error getting Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}. Status 400 Mock Error`
    );
    expect(result).toBeNull();
    });


    //todo 158
    test("Errors are handled gracefully", () => {

    })
})