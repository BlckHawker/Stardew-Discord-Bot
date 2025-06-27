const utils = require("../../utils");
const Discord = require('discord.js');

// Mock Discord.js Client and related methods
jest.mock('discord.js', () => {
    const sendMock = jest.fn();
    const getMock = jest.fn(() => ({ send: sendMock }));
    const sendUserMock = jest.fn();

    return {
        Client: jest.fn().mockImplementation(() => ({
            channels: { cache: { get: getMock } },
            users: { send: sendUserMock }
        })),
        __mocks__: {
            sendMock,
            getMock,
            sendUserMock
        }
    };
});

jest.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00Z"))
const timestamp = 1735689600

beforeAll(() => {
  Object.assign(process.env, {
    DEBUG_CHANNEL_ID: "DEBUG_CHANNEL_ID",
  });
});


describe('utils.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("sendServerMessage", () => {
        test("sends the correct message to the specified channel", () => {
            const client = new Discord.Client();
            const content = 'Test message';
            const channelId = '123456';
            utils.sendServerMessage(client, content, channelId);
            expect(client.channels.cache.get).toHaveBeenCalledWith(channelId);
            expect(client.channels.cache.get(channelId).send).toHaveBeenCalledWith(content);
        });

        test("uses DEBUG_CHANNEL_ID if no channel ID is provided", () => {
            const client = new Discord.Client();
            const content = 'Test message';
            const expectedChannelId = process.env.DEBUG_CHANNEL_ID;

            utils.sendServerMessage(client, content);

            expect(client.channels.cache.get).toHaveBeenCalledWith(expectedChannelId);
            expect(client.channels.cache.get(expectedChannelId).send).toHaveBeenCalledWith(content);
        });
    })

    describe("createClient", () => {
        test("returns a new Discord.Client instance with provided options", () => {
            const intents = ['GUILDS', 'GUILD_MESSAGES'];
            const partials = ['MESSAGE', 'CHANNEL'];
            utils.createClient(intents, partials);
            expect(Discord.Client).toHaveBeenCalledWith({
                intents,
                partials
            });
        })
    })

    //todo possible refactor with test.each
    describe("convertIsoToDiscordTimestamp", () => {
        const isoString = Date.now();
        test("returns a timestamp with no style if not provided one", () => {
            const response = utils.convertIsoToDiscordTimestamp(isoString)
            expect(response).toBe(`<t:${timestamp}>`)
        })
        test("returns a timestamp with the provided style", () => {
            const style = 't'
            const response = utils.convertIsoToDiscordTimestamp(isoString, style)
            expect(response).toBe(`<t:${timestamp}:${style}>`)
        })
    })

    describe("sendDM", () => {
        test("sends a direct message to the user", () => {
        const client = new Discord.Client();
        const content = 'content';
        const userId = '654321';
        utils.sendDM(client, content, userId);
        expect(client.users.send).toHaveBeenCalledWith(userId, content);
    });
    })

    
    
})

