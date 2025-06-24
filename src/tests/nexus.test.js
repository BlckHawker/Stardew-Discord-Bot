const MOCK_TIMESTAMP = "MOCKED_TIMESTAMP"
const DISCORD_TIMESTAMP = "DISCORD_TIMESTAMP"
const READABLE_TIMESTAMP = "READABLE"


// Utils mocked globally
jest.mock("../utils", () => ({
  getTimeStamp: jest.fn(() => MOCK_TIMESTAMP),
  convertIsoToDiscordTimestamp: jest.fn(() => DISCORD_TIMESTAMP),
  convertUnixTimestampToReadableTimestamp: jest.fn(() => READABLE_TIMESTAMP),
}));

// discordCalls mocked globally so we can mock its functions later
jest.mock("../apiCalls/discordCalls"); 

const getMockModData = (uid = 123, name = "Test Mod") => ({
  uid,
  name,
  version: "1.0",
  uploaded_time: "2000-01-01T00:00:00Z",
  category_name: "MAIN",
});

const validModData = getMockModData();

const validDiscordChannel = { name: "test-channel" };

const error = new Error("Test Error");

const setupTestEnvironment = () => {
  // Clear module cache
    jest.resetModules();

    // Mock node-fetch BEFORE requiring the module
    jest.mock("node-fetch");
    const fetchSpy = require("node-fetch"); // this is now the mocked fetch

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // AFTER mocks
    const nexus = require("../apiCalls/nexus");
    const discord = require("../apiCalls/discordCalls");

    return { fetchSpy, consoleLogSpy, consoleErrorSpy, nexus, discord };
}

const cleanUpTestEnvironment = () => {
  jest.resetModules();   // Clean module cache to prevent leakage
  jest.clearAllMocks(); // Clear all mocks/spies
}

const expectConsole = (console, message, includeTimestamp = true, isError = false) => {
  const formattedMessage = `${includeTimestamp ? `[${MOCK_TIMESTAMP}] ` : ""}${message}`

  if (isError) {
    expect(console.mock.calls[0][1]).toBe(error);
    expect(console).toHaveBeenCalledWith(formattedMessage, error);
  } else {
    expect(console).toHaveBeenCalledWith(formattedMessage);
  }
}

const expectConsoleError = (consoleErrorSpy, message) => {
  expectConsole(consoleErrorSpy, message, true, true)
};

beforeAll(() => {
  Object.assign(process.env, {
    ICCC_ROLE: "ICCC_ROLE",
    ICCC_NEXUS_MOD_ID: "ICCC_NEXUS_MOD_ID",
    NEXUS_API_KEY: "NEXUS_API_KEY"
  });
});

describe("getDiscordChannel", () => {
    let consoleErrorSpy;
    let consoleLogSpy;
    let nexus;
    let discord;
    const channelId = "channelId";

  beforeEach(() => {
     ({ consoleLogSpy, consoleErrorSpy, nexus, discord } = setupTestEnvironment());
    // Clear cached data for each test
    nexus._setCachedICCCNotifsChannel(null);
    nexus._setCachedICCCModData(null);
  });

  afterEach(() => {
    cleanUpTestEnvironment();
  });

const cases = [
  [
    "logs that the channel was found in cache and returns it",
    {
      cachedChannel: validDiscordChannel,
      fetchMock: null,
      log: "log",
      expectedMessage: `Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`,
      expectedResult: validDiscordChannel
    }
  ],
  [
    "logs an error and returns null if fetched channel returns null",
    {
      cachedChannel: null,
      fetchMock: jest.fn().mockResolvedValueOnce(null),
      log: "error",
      expectedMessage: `Error getting channel with ID ${channelId}`,
      expectedResult: null
    }
  ],
  [
    "fetches and returns the channel if not cached",
    {
      cachedChannel: null,
      fetchMock: jest.fn().mockResolvedValueOnce(validDiscordChannel),
      log: "log",
      expectedMessage: `Fetched and cached channel ${validDiscordChannel.name}`,
      expectedResult: validDiscordChannel
    }
  ]
];


test.each(cases)("%s", async (_description, { cachedChannel, fetchMock, log, expectedMessage, expectedResult }) => {
  if (fetchMock) {
    discord.getDiscordChannel = fetchMock;
  }

  const result = await nexus.getDiscordChannel(null, cachedChannel, channelId, validDiscordChannel.name);
  const console = log === "log" ? consoleLogSpy : consoleErrorSpy;

  expectConsole(console, expectedMessage);
  expect(result).toBe(expectedResult);
});

})

describe("getLatestICCCModRelease", () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let nexus;
  let discord;

  beforeEach(() => {
     ({ consoleLogSpy, consoleErrorSpy, nexus, discord } = setupTestEnvironment());

    nexus._setCachedICCCNotifsChannel(null);
    nexus._setCachedICCCModData(null);
  });

  afterEach(() => {
    cleanUpTestEnvironment();
  });

  const cases = [
  [
    "logs error and aborts when mod data retrieval fails",
    {
      setup: () => {
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
      },
      type: "error",
      expectedMessage: "Unable to get ICCC Nexus mod data. Not sending message..."
    }
  ],
  [
    "announces mod release when no previous mod data is cached",
    {
      setup: () => {
        nexus._setCachedICCCNotifsChannel(validDiscordChannel);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        nexus.getDuplicateMessage = jest.fn().mockResolvedValue(true);
      },
      type: "log",
      expectedMessage: `No ICCC mod data cached. Sending announcement in #${validDiscordChannel.name}`
    }
  ],
  [
    "does not announce when cached mod data matches latest mod data UID",
    {
      setup: () => {
        nexus._setCachedICCCNotifsChannel(validDiscordChannel);
        nexus._setCachedICCCModData(validModData);
        nexus.getDuplicateMessage = jest.fn().mockResolvedValue(true);
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
      },
      type: "log",
      expectedMessage: `Cached ICCC mod data uid matches current ICCC mod data's (${validModData.uid}). No need to send duplicate announcement`
    }
  ]
];

  test.each(cases)
    ("%s", async (_description, {setup, type, expectedMessage}) => {
  setup();
  await nexus.getLatestICCCModRelease({});
  const spy = type === "error" ? consoleErrorSpy : consoleLogSpy;
  expectConsole(spy, expectedMessage);
});

  test("announces mod release when cached mod data UID differs from latest mod data UID", async () => {
    const newModData = getMockModData(321, "Other Test Mod");
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus._setCachedICCCModData(validModData);
    nexus.getDuplicateMessage = jest.fn().mockResolvedValue(true)
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(newModData);
    await nexus.getLatestICCCModRelease({});
    expectConsole(consoleLogSpy, `Cached ICCC mod data uid (${validModData.uid}) does not match current ICCC mod data's (${newModData.uid}). Sending announcement in #${validDiscordChannel.name}`);
  });

  test("skips sending Discord message if identical notification message already exists", async () => {
    const expectedMessageContent = `<@&${process.env.ICCC_ROLE}>\nA version build of **${validModData.name} (v${validModData.version})** has been released at ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${process.env.ICCC_NEXUS_MOD_ID}`;
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    nexus.getDuplicateMessage = jest.fn().mockResolvedValueOnce({ content: expectedMessageContent });
    await nexus.getLatestICCCModRelease({});
    expectConsole(consoleLogSpy, `Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`);
  });

  test("sends Discord notification message when no duplicate message is found", async () => {
    discord.sendMessage = jest.fn(() => {});
    nexus.getDuplicateMessage = jest.fn().mockResolvedValueOnce(undefined);
    nexus._setCachedICCCNotifsChannel(validDiscordChannel);
    nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
    await nexus.getLatestICCCModRelease({});
    expect(discord.sendMessage).toHaveBeenCalledTimes(1);
  });

  test("handles unexpected errors gracefully during mod release retrieval", async () => {
    nexus.getLatestModData = jest.fn().mockRejectedValueOnce(error);
    await nexus.getLatestICCCModRelease({});
    expectConsoleError(consoleErrorSpy, "Error latest nexus mod release of ICCC.")
  });
});

describe("getLatestModData", () => {
  let consoleErrorSpy;
  let nexus;
  const modId = process.env.ICCC_NEXUS_MOD_ID;

    beforeEach(() => {
        ({ consoleErrorSpy, nexus } = setupTestEnvironment());
    });

    afterEach(() => {
      cleanUpTestEnvironment();
    });

    const cases = [
      {
        description: "mod data retrieval returns null",
        modData: null,
        validationResponse: undefined,
        expectedMessage: `[${MOCK_TIMESTAMP}] Error getting latest build nexus Stardew mod with id ${modId}. Unable to extract data`,
      },
      {
         description: "mod data is missing the 'files' property",
      modData: {},
      validationResponse: undefined,
      expectedMessage: `[${MOCK_TIMESTAMP}] There was a problem reading mod data with id ${modId}. object did not have required "files" property.`
      },
      {
        description: "mod data is missing the 'files' property",
        modData: {},
        validationResponse: { valid: false, reason: "test fail reason" },
        expectedMessage: "test fail reason"
      }
    ]

    test.each(cases)("returns null and logs error when %s", async ({modData, validationResponse, expectedMessage}) => {
    nexus.getModData = jest.fn().mockResolvedValueOnce(modData);
    if (validationResponse !== undefined) {
      nexus.validateModData = jest.fn().mockReturnValueOnce(validationResponse);
    }

    const result = await nexus.getLatestModData(modId);
    expectConsole(consoleErrorSpy, expectedMessage, false);
    expect(result).toBeNull();
  });

  test("logs and handles errors thrown during mod data validation", async () => {
    nexus.getModData = jest.fn().mockRejectedValueOnce(error);
    await nexus.getLatestModData(process.env.ICCC_NEXUS_MOD_ID);
    expectConsoleError(consoleErrorSpy, `Error getting latest build nexus Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}:`)
  });
});

describe("validateModData", () => {
    const id = "id";
    const errorMessage = `There was a problem reading mod data with id ${id}.`;
    let nexus;
    beforeEach(() => {
        ({ nexus } = setupTestEnvironment());
    });

    afterEach(() => {
      cleanUpTestEnvironment();
    });

      const cases = [
    {
      description: "modData is null",
      modData: null,
      expectedReason: `Error getting latest build nexus Stardew mod with id ${id}. Unable to extract data`
    },
    {
      description: 'modData missing "files" property',
      modData: {},
      expectedReason: `${errorMessage} object did not have required "files" property.`
    },
    {
      description: '"files" array is empty',
      modData: { files: [] },
      expectedReason: `${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`
    },
    {
      description: 'file object missing "category_name"',
      modData: { files: [{}] },
      expectedReason: `${errorMessage} At least one of the object within the "files" property does not have "category_name" property.`
    },
    {
      description: 'file has invalid "category_name"',
      modData: { files: [{ category_name: "not valid" }] },
      expectedReason: `${errorMessage} At least one of the "category_name" properties is not "ARCHIVED", "MAIN", "OLD_VERSION", nor "OPTIONAL". Found "not valid".`
    },
    {
      description: 'no "MAIN" category file present',
      modData: { files: [{ category_name: "OLD_VERSION" }] },
      expectedReason: `${errorMessage} There were 0 files that had the "category_name" property with the value "MAIN". Expected 1.`
    }
  ];

  test.each(cases)("returns invalid when %s", ({ modData, expectedReason }) => {
    const result = nexus.validateModData(modData, id);
    expect(result.valid).toBe(false);
    expect(result.reason).toEqual(`[${MOCK_TIMESTAMP}] ${expectedReason}`);
  });

    test("returns valid for properly structured modData with exactly one 'MAIN' category file", () => {
        const modData = {files: [{category_name: "MAIN"}]};
        const result = nexus.validateModData(modData, id);
        expect(result.valid).toBe(true)
    })

    test("handles unexpected errors gracefully", () => {
        const utils = require("../utils");
        utils.getTimeStamp.mockImplementationOnce(() => {
            throw error;
        });
        const result = nexus.validateModData({}, id);
        expect(result.valid).toBe(false)
        expect(result.reason).toBe(`[${MOCK_TIMESTAMP}] Error validating mod data of id ${id}: ${error}`);
    })
})

describe("getModData", () => {
  let fetchSpy;
  let consoleErrorSpy;
  let nexus;
    beforeEach(() => {
        ({ fetchSpy, consoleErrorSpy, nexus } = setupTestEnvironment());
    });

    afterEach(() => {
        cleanUpTestEnvironment();
    });

    test("returns null and logs error if API response status is not successful (2xx)", async () => {
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            statusText: "Mock Error",
            json: jest.fn().mockResolvedValue(null),
        });

    const result = await nexus.getModData(process.env.ICCC_NEXUS_MOD_ID);
    expectConsole(consoleErrorSpy, `Error getting Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}. Status 400 Mock Error`);
    expect(result).toBeNull();
    });


    test("logs and returns null when fetch throws an error", async () => {
        fetchSpy.mockRejectedValueOnce(error);
        const result = await nexus.getModData(process.env.ICCC_NEXUS_MOD_ID);
        expectConsoleError(consoleErrorSpy, `Error getting Stardew mod with id ${process.env.ICCC_NEXUS_MOD_ID}:`)
        expect(result).toBeNull();
    })
})

describe("getAllModsFromSpecificUser", () => { 
    let consoleErrorSpy;
    let consoleLogSpy;
    let nexus;
    const id = 1;

    beforeEach(() => {
        ({ consoleLogSpy, consoleErrorSpy, nexus } = setupTestEnvironment());
    });

    afterEach(() => {
        cleanUpTestEnvironment();
        nexus._setCachedNexusModReleaseChannel(null);
    });

    const cases = [
        {
          description: "logs an error if getAllTrackedMods returns null",
          setup: () => { nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce(null); },
          type: "error",
          expectedMessage: "Unable tracked stardew mod ids. Terminating new mod release checks."
        },
        {
          description: "logs an error when tracked mods is empty array",
          setup: () => {
            nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([]);
          },
          type: "error",
          expectedMessage: "Filtered mod IDs array is empty; no new Stardew Mods were found."
        },
        {
          description: "logs an error if getLatestModData returns null for a tracked mod",
          setup: () => {
            nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
            nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
          },
          type: "error",
          expectedMessage: `Unable to get mod data of id ${id}. Not sending message.`
        },
        {
          description: "logs an error if unable to get the discord channel for notifications",
          setup: () => {
            nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
            nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
            nexus.getDiscordChannel = jest.fn().mockResolvedValueOnce(null)
          },
          type: "error",
          expectedMessage: `There was an error getting nexus mod release notifs channel. Terminating sending message for mod id ${id}`
        },
        {
          description: "logs that the mod has already been announced and skips re-announcing",
          setup: () => {
            const content = `@here\nA Stardew mod has released on Hawker's page!\n Title: **${validModData.name}**\nRelease Date: ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${id}`
            nexus._setCachedNexusModReleaseChannel(validDiscordChannel)
            nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
            nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
            nexus.getDuplicateMessage = jest.fn().mockResolvedValue({content, createdTimestamp: 0 });
          },
          type: "log",
          expectedMessage: `Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`
        },
        {
          description: "logs that an announcement for the mod has been made",
          setup: () => {
            nexus._setCachedNexusModReleaseChannel(validDiscordChannel);
            nexus.getAllTrackedMods = jest.fn().mockResolvedValueOnce([id]);
            nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
            nexus.getDuplicateMessage = jest.fn().mockResolvedValue(undefined);
          },
          type: "log",
          expectedMessage: `Successfully sent announcement for mod id ${id}`
        }
    ]

    test.each(cases)("$description", async({ setup, type, expectedMessage }) => {
      setup();
      await nexus.getAllModsFromSpecificUser();
      const console = type === "log" ? consoleLogSpy : consoleErrorSpy;
      expectConsole(console, expectedMessage);
    })

    test("logs an error if an exception is caught", async () => {
        nexus.getAllTrackedMods = jest.fn().mockRejectedValueOnce(error);
        await nexus.getAllModsFromSpecificUser()
        expectConsoleError(consoleErrorSpy, `Error checking to see if there are any new Stardew mod releases`)
    })
})

describe("getAllTrackedMods", () => {
  let fetchSpy;
  let consoleErrorSpy;
  let consoleLogSpy;
  let nexus;

  beforeEach(() => {
     ({ fetchSpy, consoleLogSpy, consoleErrorSpy, nexus, discord } = setupTestEnvironment());
  });

  afterEach(() => {
      cleanUpTestEnvironment();
  });

  const cases = [
    [
      {
        description: "response has a non-2xx status",
        response: { status: "test status", statusText: "statusText" },
        expectedMessage: "Error getting tracked mods. Status test status statusText"
      }
    ],
    [
      {
        description: "filtered data array is empty",
        response: {status: 200, statusText: "statusText", json: async () => []},
        expectedMessage: "Filtered tracked mods list is empty. Unable to get ids."      
      }
    ]
  ]

  test.each(cases)
  (`logs an error and returns null if the %s`, async ({response, expectedMessage}) => {
  fetchSpy.mockResolvedValue(response);
  const result = await nexus.getAllTrackedMods();
  expectConsole(consoleErrorSpy, expectedMessage);
  expect(result).toBe(null);
});
  
  test("returns an array of mod IDs if tracked Stardew Valley mods are found", async () => {
    const mod_id = 1;
        const response = {status: 200, statusText: "statusText", json: async () => [{domain_name: "stardewvalley", mod_id: Number(mod_id)}]}
        fetchSpy.mockResolvedValue(response);
        const result = await nexus.getAllTrackedMods();
        expectConsole(consoleLogSpy, `Successfully got all stardew valley tracked mods ids.`);
        expect(result.length).toBe(1);
        expect.arrayContaining(mod_id)
  })

  test("logs an error and returns null if an exception is thrown during fetch", async () => {
    fetchSpy.mockRejectedValueOnce(error)
    const result = await nexus.getAllTrackedMods()
    expectConsoleError(consoleErrorSpy, "Error getting tracked mods:")
    expect(result).toBe(null)
  })
})