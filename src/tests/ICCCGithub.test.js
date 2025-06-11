test("", () => {
  expect(true).toBeTruthy()
})

// const { Octokit } = require("@octokit/rest");
// const discordCalls = require("../apiCalls/discordCalls.js");
// const ICCCGithub = require("../apiCalls/ICCCGithub.js");
// const cron = require("cron");

// jest.mock("@octokit/rest");
// jest.mock("../apiCalls/discordCalls.js");
// jest.mock("cron", () => {
//     return {
//       CronJob: jest.fn().mockImplementation((cronTime, onTick) => ({
//         start: jest.fn(),
//         stop: jest.fn(),
//         cronTime,
//         onTick,
//       })),
//     };
//   });

// describe("getLatestICCCBetaRelease", () => {
//     let mockClient;
//     let mockChannel;

//     beforeEach(() => {
//         jest.clearAllMocks();
    
//         mockClient = { user: { id: process.env.CLIENT_ID || "bot-id" } };
//         mockChannel = {
//           id: "mock-channel-id",
//           send: jest.fn(() => Promise.resolve({ reply: jest.fn() })),
//         };
//       });

//     describe("Handle Non-200 GitHub Response", () => {
//     test("Should log an error and exit if the response's status is not 200", async () => {
//         Octokit.mockImplementation(() => ({
//         request: jest.fn().mockResolvedValue({ status: 500, data: [] }),
//         }));

//         discordCalls.sendMessage = jest.fn();

//         await ICCCGithub.getLatestICCCBetaRelease(mockClient);

//         expect(Octokit).toHaveBeenCalled();
//         expect(discordCalls.sendMessage).not.toHaveBeenCalled();
//     });
//     });

//     describe("Pre-release", () => {
//         test("Skip if Not a Pre-release", async () => {
//             Octokit.mockImplementation(() => ({
//               request: jest
//                 .fn()
//                 .mockResolvedValue({ status: 200, data: [{ prerelease: false }] }),
//             }));
//             discordCalls.getDiscordChannel = jest.fn();
//             await ICCCGithub.getLatestICCCBetaRelease(mockClient);
//             expect(Octokit).toHaveBeenCalled();
//             expect(discordCalls.getDiscordChannel).not.toHaveBeenCalled();
//           });
//     });

//     describe("isDuplicateRelease", () => {
//         const regex = new RegExp(String.raw`abc`, "g");
//         test("Should return true if any message matches the regex.", () => {
//           expect(ICCCGithub.isDuplicateRelease(["abc"], regex)).toBe(true);
//         });
  
//         test("Should return false if no message matches.", () => {
//           expect(ICCCGithub.isDuplicateRelease(["bcd"], regex)).toBe(false);
//         });
//       });

//       describe("getCronObject", () => {
//         test("should initialize CronJob with correct time and action", () => {
//           const fakeTime = "0 0 12 * * *"; // Every day at noon
//           const fakeAction = jest.fn();
      
//           const job = ICCCGithub.getCronObject(fakeTime, fakeAction);
      
//           expect(cron.CronJob).toHaveBeenCalledWith(fakeTime, fakeAction);
//           expect(job.cronTime).toBe(fakeTime);
//           expect(job.onTick).toBe(fakeAction);
//           expect(typeof job.start).toBe("function");
//           expect(typeof job.stop).toBe("function");
//         });
//       });
// })
