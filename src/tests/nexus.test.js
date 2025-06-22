//todo remove redundant code
//todo remove/optimized duplicate code
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
    NEXUS_API_KEY: "NEXUS_API_KEY"
  });
});

const restoreConsoleSpies = (...spies) => spies.forEach(spy => spy.mockRestore());

describe("getOrFetchChannel", () => {
    let consoleErrorSpy;
    let consoleLogSpy;
    let nexus;
    let discord;

  beforeEach(() => {
    ({ consoleErrorSpy, consoleLogSpy, nexus } = setupNexusWithConsoleSpies());

    // Import modules AFTER spies are setup
    discord = require("../apiCalls/discordCalls");

    // Clear cached data for each test
    nexus._setCachedICCCNotifsChannel(null);
    nexus._setCachedICCCModData(null);
  });

  afterEach(() => {
    jest.resetModules(); // Clean module cache to prevent leakage
    jest.clearAllMocks(); // Clear all mocks/spies
  });

    test("logs that the channel was found in cache and returns it", async () => {
      const channelId = "channelId";
      const result = await nexus.getOrFetchChannel(null, validDiscordChannel, channelId, validDiscordChannel.name)
      expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`);
      expect(result).toBe(validDiscordChannel)
    })

    test("logs an error and returns null if fetched channel returns null", async () => {
      const channelId = "channelId";
      discord.getDiscordChannel = jest.fn().mockResolvedValueOnce(null)
      const result = await nexus.getOrFetchChannel(null, null, channelId, validDiscordChannel.name)
      expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Error getting channel with ID ${channelId}`);
      expect(result).toBe(null)
    })

    test("fetches and returns the channel if not cached", async () => {
      const channelId = "channelId";
      discord.getDiscordChannel = jest.fn().mockResolvedValueOnce(validDiscordChannel)
      const result = await nexus.getOrFetchChannel(null, null, channelId, validDiscordChannel.name)
      expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Fetched and cached channel ${validDiscordChannel.name}`);
      expect(result).toBe(validDiscordChannel)
    })
})

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
    nexus._setCachedICCCNotifsChannel(null);
    nexus._setCachedICCCModData(null);
  });

  afterEach(() => {
    restoreConsoleSpies(consoleErrorSpy, consoleLogSpy);
  });

  test("logs error and aborts when mod data retrieval fails", async () => {
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
    await nexus.getLatestICCCModRelease();
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get ICCC Nexus mod data. Not sending message...`);
  });

  test("logs error and aborts when discord channel retrieval fails", async () => {
    const channelName = "ICCC nexus release notifs";
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    nexus.getOrFetchChannel = jest.fn().mockResolvedValue(null)
    await nexus.getLatestICCCModRelease()
    expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting ${channelName} channel. Terminating sending message`);

  })

  test("announces mod release when no previous mod data is cached", async () => {
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] No ICCC mod data cached. Sending announcement in #${validDiscordChannel.name}`);
  });

  test("does not announce when cached mod data matches latest mod data UID", async () => {
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus._setCachedICCCModData(validModData);
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

    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus._setCachedICCCModData(validModData);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(newModData);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid (${validModData.uid}) does not match current ICCC mod data's (${newModData.uid}). Sending announcement in #${validDiscordChannel.name}`);
  });

  test("skips sending Discord message if identical notification message already exists", async () => {
    const expectedMessageContent = `<@&${process.env.ICCC_ROLE}>\nA version build of **${validModData.name} (v${validModData.version})** has been released at ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${process.env.ICCC_NEXUS_MOD_ID}`;
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    discord.getDiscordMessages.mockResolvedValueOnce([{ content: expectedMessageContent }]);
    await nexus.getLatestICCCModRelease({});
    expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`);
  });

  test("sends Discord notification message when no duplicate message is found", async () => {
    discord.sendMessage = jest.fn(() => {});
    discord.getDiscordMessages = jest.fn(() => []);
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
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
  let nexus;

    beforeEach(() => {
            jest.resetModules(); // Clear module cache
            // Mock node-fetch BEFORE requiring the module
            jest.mock("node-fetch");
            fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch
            consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
            nexus = require("../apiCalls/nexus"); // AFTER mocks
    });

    afterEach(() => {
        jest.resetModules(); // Clean module cache to prevent leakage
        jest.clearAllMocks(); // Clear all mocks/spies
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

  test("returns null if mod data is considered invalid", async () => {
    const response = { valid: false, reason: "test fail reason" };
    nexus.getModData = jest.fn().mockResolvedValueOnce({});
    nexus.validateModData = jest.fn().mockReturnValueOnce(response);
    const result = await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(response.reason);
    expect(result).toBeNull();
  })


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

describe("validateModData", () => {
    const id = "id";
    const errorMessage = `There was a problem reading mod data with id ${id}.`;
    beforeEach(() => {
        jest.resetModules(); // Clear module cache

        // Mock node-fetch BEFORE requiring the module
        jest.mock("node-fetch");

        fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch

        nexus = require("../apiCalls/nexus"); // AFTER mocks
    });

    afterEach(() => {
        jest.resetModules(); // Clean module cache to prevent leakage
        jest.clearAllMocks(); // Clear all mocks/spies
    });

    test("returns invalid when modData is null", () => {
        const modData = null;
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`);
    })

    test("returns invalid when modData does not contain a 'files' property", () => {
        const modData = {};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] ${errorMessage} object did not have required "files" property.`);
    })

    test("returns invalid when 'files' array exists but is empty", () => {
        const modData = {files: []};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] ${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`);
    })

    test("returns invalid when an object inside 'files' lacks 'category_name' property", () => {
        const modData = {files: [{}]};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] ${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`);
    })

    test("returns invalid when 'category_name' property has an unexpected value", () => {
        const category_name = "not valid";
        const modData = {files: [{category_name}]};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] ${errorMessage} At least one of the "category_name" properties is not "ARCHIVED", "MAIN", "OLD_VERSION", nor "OPTIONAL". Found "${category_name}".`);
    })

    test("returns invalid when the number of 'MAIN' category files is not exactly one", () => {
        const category_name = "OLD_VERSION";
        const modData = {files: [{category_name}]};
        const result = nexus.validateModData(modData, id);
        const mainFiles = modData.files.filter(f => f.category_name === "MAIN");
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] ${errorMessage} There were ${mainFiles.length} files that had the "category_name" property with the value "MAIN". Expected 1.`);
    })

    test("handles unexpected error from getTimeStamp gracefully", () => {
        const utils = require("../utils");
        let error = new Error("Mocked timestamp error")
        utils.getTimeStamp.mockImplementationOnce(() => {
            throw error;
        });
        const result = nexus.validateModData({}, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${utils.getTimeStamp()}] Error validating mod data of id ${id}: ${error}`);
    })

    test("returns valid for properly structured modData with exactly one 'MAIN' category file", () => {
        const modData = {files: [{category_name: "MAIN"}]};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(true)
    })

})


describe("getModData", () => {
  let fetchSpy;
  let consoleErrorSpy;
  let nexus;
    beforeEach(() => {
        jest.resetModules(); // Clear module cache

        // Mock node-fetch BEFORE requiring the module
        jest.mock("node-fetch");

        fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch

        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

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

describe("getAllModsFromSpecificUser", () => {
    let consoleErrorSpy;
    let consoleLogSpy;
    let nexus;
    let discord;

    beforeEach(() => {
        jest.resetModules(); // Clear module cache

        // Mock node-fetch BEFORE requiring the module
        jest.mock("node-fetch");

        fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch

        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        nexus = require("../apiCalls/nexus"); // AFTER mocks
        discord = require("../apiCalls/discordCalls");

    });

    afterEach(() => {
        jest.resetModules(); // Clean module cache to prevent leakage
        jest.clearAllMocks(); // Clear all mocks/spies
        nexus._setCachedNexusModReleaseChannel(null);
    });

    test("logs an error if getAllTrackedMods returns null", async () => {
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce(null);
        await nexus.getAllModsFromSpecificUser();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable tracked stardew mod ids. Terminating new mod release checks.`);
    })

    test("logs an error if getAllTrackedMods returns an empty array", async () => {
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([]);
        await nexus.getAllModsFromSpecificUser();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Filtered mod IDs array is empty; no new Stardew Mods were found.`);
    })

    test("logs an error if getLatestModData returns null for a tracked mod", async () => {
        const id = 1;
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
        await nexus.getAllModsFromSpecificUser();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get mod data of id ${id}. Not sending message.`);
    })

    test("logs an error if unable to get the discord channel for notifications", async () => { 
        const id = 1;
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        nexus.getOrFetchChannel = jest.fn().mockResolvedValueOnce(null)
        await nexus.getAllModsFromSpecificUser();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting nexus mod release notifs channel. Terminating sending message for mod id ${id}`);
    })

    test("logs that the mod has already been announced and skips re-announcing", async () => {
        const id = 1;
        const utils = require("../utils");
        const content = `@here\nA Stardew mod has released on Hawker's page!\n Title: **${validModData.name}**\nRelease Date: ${utils.convertIsoToDiscordTimestamp(validModData.uploaded_time)}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`
        const duplicatedMessage = {content, createdTimestamp: 0 };
        nexus._setCachedNexusModReleaseChannel(validDiscordChannel)
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        discord.getDiscordMessages = jest.fn().mockResolvedValue([duplicatedMessage]);
        await nexus.getAllModsFromSpecificUser()
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${utils.convertUnixTimestampToReadableTimestamp(duplicatedMessage.createdTimestamp)}. Terminating sending mod notification`);
    })

    test("logs that an announcement for the mod has been made", async () => {
        const id = 1;
        nexus._setCachedNexusModReleaseChannel(validDiscordChannel)
        nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        discord.getDiscordMessages = jest.fn().mockResolvedValue([]);
        await nexus.getAllModsFromSpecificUser()
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Successfully sent announcement for mod id ${id}`);
    })

    test("logs an error if an exception is caught", async () => {
        let error = new Error("Test error");
        nexus.getAllTrackedMods = jest.fn().mockRejectedValueOnce(error);
        await nexus.getAllModsFromSpecificUser()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining(`[${MOCK_TIMESTAMP}] Error checking to see if there are any new Stardew mod releases`),
          error
        );
    })
})


describe("getAllTrackedMods", () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let nexus;
  let discord;

  beforeEach(() => {
      jest.resetModules(); // Clear module cache

      // Mock node-fetch BEFORE requiring the module
      jest.mock("node-fetch");

      fetchSpy = require("node-fetch"); // <-- this is now the mocked fetch

      consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      nexus = require("../apiCalls/nexus"); // AFTER mocks
      discord = require("../apiCalls/discordCalls");

  });

  afterEach(() => {
      jest.resetModules(); // Clean module cache to prevent leakage
      jest.clearAllMocks(); // Clear all mocks/spies
  });

  test("logs an error and returns null if the response has a non-2xx status", async () => {
        const response = {status: "test status", statusText: "statusText"}
        fetchSpy.mockResolvedValue(response);
        const result = await nexus.getAllTrackedMods();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Error getting tracked mods. Status ${response.status} ${response.statusText}`);
        expect(result).toBe(null)

  })
  
  test("logs an error and returns null if the filtered data array is empty", async () => {
        const response = {status: 200, statusText: "statusText", json: async () => []}
        fetchSpy.mockResolvedValue(response);
        const result = await nexus.getAllTrackedMods();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Filtered tracked mods list is empty. Unable to get ids.`);
        expect(result).toBe(null)
  })

  test("returns an array of mod IDs if tracked Stardew Valley mods are found", async () => {
    const mod_id = 1;
        const response = {status: 200, statusText: "statusText", json: async () => [{domain_name: "stardewvalley", mod_id: Number(mod_id)}]}
        fetchSpy.mockResolvedValue(response);
        const result = await nexus.getAllTrackedMods();
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Successfully got all stardew valley tracked mods ids.`);
        expect(result.length).toBe(1);
        expect.arrayContaining(mod_id)
  })

  test("logs an error and returns null if an exception is thrown during fetch", async () => {
    let error = new Error("error test")
    fetchSpy.mockRejectedValueOnce(error)
    const result = await nexus.getAllTrackedMods()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error getting tracked mods:"),
      error
    );
    expect(result).toBe(null)
  })
})