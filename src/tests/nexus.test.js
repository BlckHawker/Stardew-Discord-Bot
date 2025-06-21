

const MOCK_TIMESTAMP = "MOCKED_TIMESTAMP"
const DISCORD_TIMESTAMP = "DISCORD_TIMESTAMP"
const READABLE_TIMESTAMP = "READABLE"

const fetch = require("node-fetch");
jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");
const nexus = require("../apiCalls/nexus")
jest.mock("../utils", () => ({
  getTimeStamp: jest.fn(() => MOCK_TIMESTAMP),
  convertIsoToDiscordTimestamp: jest.fn(() => DISCORD_TIMESTAMP),
  convertUnixTimestampToReadableTimestamp: jest.fn(() => READABLE_TIMESTAMP),
}));

jest.mock("../apiCalls/discordCalls")
const discord = require("../apiCalls/discordCalls")

const validModData = {
      uid: 123,
      name: "Test Mod",
      version: "1.0",
      uploaded_time: "2000-01-01T00:00:00Z",
      category_name: "MAIN",
    }

const validFullModData = {
  files: [
    validModData
  ],
};

const validDiscordChannel = { name: "test-channel" }

beforeAll(() => {
  Object.assign(process.env, {
    ICCC_ROLE: "ICCC_ROLE",
    ICCC_NEXUS_MOD_ID: "ICCC_NEXUS_MOD_ID"
    
  });
});

const setupConsoleSpies = () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  return { consoleErrorSpy, consoleLogSpy };
};

const restoreConsoleSpies = (...spies) => spies.forEach(spy => spy.mockRestore());


//todo change the describe / test descriptions to be more insightful
describe("getLatestICCCModRelease", () => {

    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.restoreAllMocks();
        ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());
    })

    afterEach(() => {
        restoreConsoleSpies(consoleErrorSpy, consoleLogSpy)
        nexus._setCachedNotifsChannel(null);
        nexus._setCachedModData(null);
    });

    test("if there is a problem getting modData", async () => {
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(null);
        await nexus.getLatestICCCModRelease();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get ICCC Nexus mod data. Not sending message...`);
    })


    describe("if \"cachedNotifsChannel\" is null", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
            ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());
            nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        })

        afterEach(() => {
            restoreConsoleSpies(consoleErrorSpy, consoleLogSpy)
        });

        test("if there is a problem getting cachedNotifsChannel", async () => {
            discord.getDiscordChannel.mockResolvedValueOnce(null);
            await nexus.getLatestICCCModRelease({});
            expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting ICCC nexus notifs channel. Terminating sending message`);
        })

        test("cachedNotifsChannel was gotten successfully", async () => {
            discord.getDiscordChannel.mockResolvedValueOnce({ name: "test-channel" });
            await nexus.getLatestICCCModRelease({});
            expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] ICCC nexus notifs channel gotten successfully`);
        });
    })

    test("if cachedNotifsChannel is not null, no need to fetch it again", async () => {
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`);
    })

    test("cachedModData is null", async () => {
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] No ICCC mod data cached. Sending announcement in #${validDiscordChannel.name}`);
    })

    test("cachedModData is cached with duplicate data",async  () => {
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus._setCachedModData(validModData)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid matches current ICCC mod data's (${validModData.uid}). No need to send duplicate announcement`);
    })

    test("cachedModData is cached with different data", async () => {
        const newModData = {
            uid: 321,
            name: "Other Test Mod",
            version: "2.0",
            uploaded_time: "3000-01-01T00:00:00Z",
            category_name: "MAIN",
            };
            
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus._setCachedModData(validModData)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(newModData);
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Cached ICCC mod data uid (${validModData.uid}) does not match current ICCC mod data's (${newModData.uid}). Sending announcement in #${validDiscordChannel.name}`);
    })

    test("if duplicate message is found, then don't send discord message", async () => {
        const expectedMessageContent = `<@&${process.env.ICCC_ROLE}>\nA version build of **${validModData.name} (v${validModData.version})** has been released at ${DISCORD_TIMESTAMP}!\nhttps://www.nexusmods.com/stardewvalley/mods/${process.env.ICCC_NEXUS_MOD_ID}`
        consoleLogSpy(expectedMessageContent)
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        discord.getDiscordMessages.mockResolvedValueOnce([{content: expectedMessageContent}])
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Mod (uid ${validModData.uid}) has already been announced in #${validDiscordChannel.name} at ${READABLE_TIMESTAMP}. Terminating sending mod notification`)
    })

    test("if duplicate message cannot be found, send discord message", async () => {
        discord.sendMessage = jest.fn(() => {});
        discord.getDiscordMessages = jest.fn(() => [])
        nexus._setCachedNotifsChannel(validDiscordChannel)
        nexus.getLatestModData = jest.fn().mockResolvedValueOnce(validModData);
        await nexus.getLatestICCCModRelease({});
        expect(discord.sendMessage).toHaveBeenCalledTimes(1);
    })

    test("Errors should be handled gracefully", async () => {
        let error = new Error("Test error")
        nexus.getLatestModData = jest.fn().mockRejectedValueOnce(error);
        await nexus.getLatestICCCModRelease({})
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error latest nexus mod release of ICCC"),
            error
        );
    })
})

describe("getLatestModData", () => {
    //todo (87)
    test("modData is null", () => {

    })

    //todo (96)
    test("There isn't a property called \"files\"", () => {

    })

    //todo 102
    test(" each object within \"files\" doesn't have a \"category_name\" property", () => {

    })

    //todo 107
    test("verify each \"category_name\" property is not either \"OLD_VERSION\" or \"MAIN\"", () => {

    })

    //todo 114
    test("verify there is not exactly one \"category_name\" property with the value \"MAIN\"", () => {

    })

    //todo 127
    test("Errors are handled gracefully", () => {

    })
})

describe("getModData", () => {
    //todo 145
    test("response does not have a status that starts with a 2", () => {

    })

    //todo 158
    test("Errors are handled gracefully", () => {

    })
})