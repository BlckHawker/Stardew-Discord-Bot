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

const validFullModData = {
    files: [
        {
            uid: 123,
            category_name: "MAIN"
        }
    ]
}

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
        //todo if there is a problem getting cachedNotifsChannel (28)
        test("")

        //todo cachedNotifsChannel was gotten successfully (33)
    })

    //todo (38)
    test("if cachedNotifsChannel is not null, no need to fetch it again", () => {

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