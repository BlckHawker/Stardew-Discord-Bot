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

const validFullModData = {
  files: [
    {
      uid: 123,
      name: "Test Mod",
      version: "1.0",
      uploaded_time: "2000-01-01T00:00:00Z",
      category_name: "MAIN",
    },
  ],
};

const validDiscordChannel = { name: "test-channel" }

const mockFetchResponse = (data, options = {}) =>  {
  const defaultOptions = {
    status: 200,
    ...options,
  };
  return fetch.mockResolvedValueOnce(new Response(JSON.stringify(data), defaultOptions));
}

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
    });

    test("if there is a problem getting modData", async () => {
        jest.spyOn(nexus, "getLatestModData").mockResolvedValueOnce(null);
        await nexus.getLatestICCCModRelease();
        expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Unable to get ICCC Nexus mod data. Not sending message...`);
    })

    //todo (23)
    describe("if \"cachedNotifsChannel\" is null", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
            ({ consoleErrorSpy, consoleLogSpy } = setupConsoleSpies());
        })

        afterEach(() => {
            restoreConsoleSpies(consoleErrorSpy, consoleLogSpy)
        });

        //todo (28)
        test("if there is a problem getting cachedNotifsChannel", async () => {
            jest.spyOn(nexus, "getLatestModData").mockResolvedValueOnce(validFullModData.files[0]);
            discord.getDiscordChannel.mockResolvedValueOnce(null);
            await nexus.getLatestICCCModRelease({});
            expect(consoleErrorSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] There was an error getting ICCC nexus notifs channel. Terminating sending message`);
        })

        //todo (33)
        test("cachedNotifsChannel was gotten successfully", async () => {
            jest.spyOn(nexus, "getLatestModData").mockResolvedValueOnce(validFullModData.files[0]);
            discord.getDiscordChannel.mockResolvedValueOnce({ name: "test-channel" });
            await nexus.getLatestICCCModRelease({});
            expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] ICCC nexus notifs channel gotten successfully`);
        });
    })

    //todo (38)
    test("if cachedNotifsChannel is not null, no need to fetch it again", async () => {
        nexus._setCachedNotifsChannel(validDiscordChannel)
        jest.spyOn(nexus, "getLatestModData").mockResolvedValueOnce(validFullModData.files[0]);
        await nexus.getLatestICCCModRelease({});
        expect(consoleLogSpy).toHaveBeenCalledWith(`[${MOCK_TIMESTAMP}] Notifis channel (#${validDiscordChannel.name}) already cached. Skipping fetch`);
        nexus._setCachedNotifsChannel(null)
    })

    //todo (42)
    test("cachedModData is null", () => {

    })

    //todo (46)
    test("cachedModData is cached with duplicate data", () => {

    })

    //todo (52)
    test("cachedModData is chached with different data", () => {

    })

    //todo (68)
    test("if duplicate message is found, then don't send discord message", () => {

    })

    //todo (73)
    test("if duplicate message cannot be found, send discord message", () => {

    })

    //todo (76)
    test("Errors should be handled gracefully", () => {

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