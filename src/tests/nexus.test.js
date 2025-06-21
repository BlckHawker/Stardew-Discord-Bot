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

const validModData = {
  uid: 123,
  name: "Test Mod",
  version: "1.0",
  uploaded_time: "2000-01-01T00:00:00Z",
  category_name: "MAIN",
};

const validDiscordChannel = { name: "test-channel" };

const setupNexusWithConsoleSpies = () => {
  jest.resetModules();

    // Setup spies BEFORE importing tested modules
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Import module AFTER spies are setup
  const nexus = require("../apiCalls/nexus");
  return { consoleErrorSpy, consoleLogSpy, nexus };
}

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
    ({ consoleErrorSpy, consoleLogSpy, nexus } = setupNexusWithConsoleSpies());

    // Import modules AFTER spies are setup
    discord = require("../apiCalls/discordCalls");

    // Clear cached data for each test
    nexus._setCachedNotifsChannel(null);
    nexus._setCachedModData(null);
  });

  afterEach(() => {
    restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
  });

  test("logs error and aborts when mod data retrieval fails", async () => {
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
    await nexus.getLatestICCCModRelease();
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get ICCC Nexus mod data. Not sending message...`);
  });

  describe("when cachedNotifsChannel is not cached yet", () => {
    beforeEach(() => {
      // no resetModules here to keep spies & modules
      nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    });

    test("logs error and aborts if unable to fetch notification channel", async () => {
      discord.getDiscordChannel.mockResolvedValueOnce(null);
      await nexus.getLatestICCCModRelease({});
      expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting ICCC nexus notifs channel. Terminating sending message`);
    });

    test("successfully caches the notification channel after fetching", async () => {
      discord.getDiscordChannel.mockResolvedValueOnce({ name: "test-channel" });
      await nexus.getLatestICCCModRelease({});
      expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] ICCC nexus notifs channel gotten successfully`);
    });
  });

  test("reuses cached notification channel without fetching again", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`);
  });

  test("announces mod release when no previous mod data is cached", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] No ICCC mod data cached. Sending announcement in #${validDiscordChannel.name}`);
  });

  test("does not announce when cached mod data matches latest mod data UID", async () => {
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus._setCachedModData(validModData);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid matches current ICCC mod data's (${validModData.uid}). No need to send duplicate announcement`);
  });

  test("announces mod release when cached mod data UID differs from latest mod data UID", async () => {
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

  test("skips sending Discord message if identical notification message already exists", async () => {
    const expectedMessageContent = `<@&${process.env.ICCC_ROLE}>\nA version build of **${validModData.name} (v${validModData.version})** has been released at ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${process.env.ICCC_NEXUS_MOD_ID}`;
    consoleLogSpy(expectedMessageContent);  // <-- seems like a stray call? Might want to remove this

    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    discord.getDiscordMessages.mockResolvedValueOnce([{ content: expectedMessageContent }]);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`);
  });

  test("sends Discord notification message when no duplicate message is found", async () => {
    discord.sendMessage = jest.fn(() => {});
    discord.getDiscordMessages = jest.fn(() => []);
    nexus._setCachedNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(discord.sendMessage).toHaveBeenCalledTimes(1);
  });

  test("handles unexpected errors gracefully during mod release retrieval", async () => {
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
    ({ consoleErrorSpy, consoleLogSpy, nexus } = setupNexusWithConsoleSpies()) 
  });

  afterEach(() => {
    restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
  });

  test("returns null and logs error if mod data retrieval returns null", async () => {
    nexus.getModData = jest.fn().mockResolvedValueOnce(null);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Error getting latest build nexus Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}. Unable to extract data`);
    expect(result).toBeNull();
  });

  test("returns null and logs error if mod data is missing the 'files' property", async () => {
    const modData = {};
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. object did not have required "files" property.`);
    expect(result).toBeNull();
  });

  test("returns null and logs error if any file object lacks 'category_name' property", async () => {
    const modData = { files: [{}] };
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. At least one of the object within the "files" property does not have "category_name" property.`);
    expect(result).toBeNull();
  });

  test("returns null and logs error if any 'category_name' is not 'OLD_VERSION' or 'MAIN'", async () => {
    const modData = { files: [{ category_name: "OLD_VERSION" }, { category_name: "not valid" }] };
    const allCategoryNames = modData.files.map(f => `"${f.category_name}"`);
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. At least one of the "category_name" properties is not "OLD_VERSION" nor "MAIN". Found ${allCategoryNames.join(", ")}.`);
    expect(result).toBeNull();
  });

  test("returns null and logs error if there is not exactly one 'MAIN' category file", async () => {
    const modData = { files: [{ category_name: "MAIN" }, { category_name: "MAIN" }] };
    const mainFiles = modData.files.filter(f => f.category_name === "MAIN");
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${process.env.ICCC_NEXUS_MOD_ID}. There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`);
    expect(result).toBeNull();
  });

  test("logs and handles errors thrown during mod data validation", async () => {
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
    let fetchSpy;
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.resetModules(); // Clear module cache

        // Mock node-fetch BEFORE requiring the module
        jest.mock("node-fetch");

        fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        nexus = require("../apiCalls/nexus"); // AFTER mocks
    });

    afterEach(() => {
        jest.resetModules(); // Clean module cache to prevent leakage
        jest.clearAllMocks(); // Clear all mocks/spies
    });

    test("returns null and logs error if API response status is not successful (2xx)", async () => {

        fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            statusText: "Mock Error",
            json: jest.fn().mockResolvedValue(null),
        });


    // Log fetch calls to verify the mock is set up correctly
    // mock fetch to return a response object with status 400
    const result = await nexus.getModData(process.env.ICCC_NEXUS_MOD_ID);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[${MOCK_TIMESTAMP}] Error getting Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}. Status 400 Mock Error`
    );
    expect(result).toBeNull();
    });


    test("logs and returns null when fetch throws an error", async () => {
        const error = new Error("Test error");
        fetchSpy.mockRejectedValueOnce(error);
        const result = await nexus.getModData(process.env.ICCC_NEXUS_MOD_ID);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Error getting Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}:`),
        error
        );
        expect(result).toBeNull();
    })
})