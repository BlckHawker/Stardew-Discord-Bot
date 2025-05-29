require("dotenv").config();
const fetch = require("node-fetch");
const utils = require("../utils");
const youtube = require("../apiCalls/youtube");
const discordCalls = require("../apiCalls/discordCalls");
jest.mock("node-fetch");

const setupTimeMock = () => {
  jest.spyOn(utils, "getTimeStamp").mockReturnValue("mocked-timestamp");
};

const setupConsoleErrorMock = () => {
  return jest.spyOn(console, "error").mockImplementation(() => {});
};

const mockFetchOnce = (ok, json) => {
  fetch.mockResolvedValueOnce({
    ok,
    json: async () => json,
  });
};

beforeAll(() => {
  process.env.STARDEW_UPLOADS_NOTIFS_ROLE = "<mocked-stardew-role>";
  process.env.OTHER_UPLOADS_NOTIFS_ROLE = "<mocked-other-role>";
});


describe("getMessageContent", () => {
  
  const mockVideo = {
      videoId: "12345",
      title: "Title",
      description: "Description",
      published: "2023-10-01T00:00:00Z",
      tags: [],
      link: "https://www.youtube.com/watch?v=12345",
    };

  test("sends a message with Stardew Upload notifs role if the video is stardew related", async () => {
    const result = youtube.getMessageContent(true,mockVideo)
    expect(result).toContain(process.env.STARDEW_UPLOADS_NOTIFS_ROLE);
    expect(result).toContain(`**${mockVideo.title}**`);
    expect(result).toContain(mockVideo.link);
  });

    test("sends a message with Other Upload notifs role if the video is not stardew related", async () => {
    const result = youtube.getMessageContent(false,mockVideo)
    expect(result).toContain(process.env.OTHER_UPLOADS_NOTIFS_ROLE);
    expect(result).toContain(`**${mockVideo.title}**`);
    expect(result).toContain(mockVideo.link);
  });
})

describe("sendLatestVideoMessage", () => {
  
  const client = { users: { send: jest.fn() } };
  const validVideo = {
    videoId: "12345",
    title: "Title",
    description: "Description",
    published: "2023-10-01T00:00:00Z",
    tags: [],
    link: "https://www.youtube.com/watch?v=12345",
  };
  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock utils.getTimeStamp to return a fixed value for consistent logs
    setupTimeMock();
  });

  test("logs an error if getLatestYoutubeVideo returns null", async () => {
    jest.spyOn(youtube, "getLatestYoutubeVideo").mockResolvedValue(null);
    const consoleErrorSpy = setupConsoleErrorMock();
    await youtube.sendLatestVideoMessage(client);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[mocked-timestamp] Couldn't load videos."
    );
  });

  test("Doesn't call \"getDiscordMessages\" if \"checkIfAlreadyNotified\" returns false", async () => {
    jest.spyOn(youtube, "getLatestYoutubeVideo").mockResolvedValue(validVideo);
    jest.spyOn(discordCalls, "getDiscordChannel").mockResolvedValue(null);
    jest.spyOn(youtube, "checkIfAlreadyNotified").mockReturnValue(false);
    const getMessagesSpy = jest.spyOn(discordCalls, "getDiscordMessages");
    await youtube.sendLatestVideoMessage(client);
    expect(getMessagesSpy).not.toHaveBeenCalled();

    getMessagesSpy.mockRestore();
  });

});

describe("checkIfAlreadyNotified", () => {
    //before each test, mock "logAlreadySentMessage" function to print out hello world in the console
    beforeEach(() => {
        jest.restoreAllMocks();
        
    });

    describe.each([
      //isStardewRelated is false, latestVideoRef is null, latestVideoRef.videoId is not equal to currentVideo.videoId, should return false
      [false, null, { videoId: "currentVideoId" }, false],
      //isStardewRelated is false, latestVideoRef is null, latestVideoRef.videoId equals currentVideo.videoId, should return false
      [false, null, null, false],
      //isStardewRelated is false, latestVideoRef is not null, latestVideoRef.videoId is not equal to currentVideo.videoId, should return false
      [false, { videoId: "latestVideoId" }, { videoId: "currentVideoId" }, false],
      //isStardewRelated is false, latestVideoRef is not null, latestVideoRef.videoId is equal to currentVideo.videoId, should return false
      [false, { videoId: "latestVideoId" }, { videoId: "latestVideoId" }, false],
      //isStardewRelated is true, latestVideoRef is null, latestVideoRef.videoId is not equal to currentVideo.videoId, should return false
      [true, null, { videoId: "latestVideoId" }, false],
      //isStardewRelated is true, latestVideoRef is null, latestVideoRef.videoId equals currentVideo.videoId, should return false
      [true, null, null, false],
      //isStardewRelated is true, latestVideoRef is not null, latestVideoRef.videoId is not equal to currentVideo.videoId, should return false      
      [true, { videoId: "latestVideoId" }, { videoId: "currentVideoId" }, false],
      //isStardewRelated is true, latestVideoRef is not null, latestVideoRef.videoId is equal to currentVideo.videoId, should return true
      [true, { videoId: "latestVideoId" }, { videoId: "latestVideoId" }, true],
    ])
    ("checkIfAlreadyNotified(%p, %p, %p) => %p",
    (isStardewRelated, latestVideoRef, currentVideo, expected) => {
    test(`returns ${expected}`, () => {
      jest
        .spyOn(youtube, "logAlreadySentMessage")
        .mockImplementation(() => {});
      const result = youtube.checkIfAlreadyNotified(
        isStardewRelated,
        latestVideoRef,
        currentVideo,
        { createdTimestamp: 0 },
        { name: "test" }
        );
      expect(result).toBe(expected);
    });
  }
);

});

describe("isStardewRelatedVideo", () => {
  beforeEach(() => {
        jest.restoreAllMocks();
        
    });
  test("returns true if video title contains 'stardew'", () => {
    const video = { title: "Stardew Valley Gameplay" };
    expect(youtube.isStardewRelatedVideo(video)).toBe(true);
  });

  test("returns true if video description contains 'stardew'", () => {
    const video = {
      title: "",
      description: "This is a Stardew Valley tutorial.",
    };
    expect(youtube.isStardewRelatedVideo(video)).toBe(true);
  });

  test("returns true if video tags contain 'stardew'", () => {
    const video = {
      title: "",
      description: "",
      tags: ["gaming", "stardew", "valley"],
    };
    expect(youtube.isStardewRelatedVideo(video)).toBe(true);
  });

  test("returns false if video does not contain 'stardew' in title, description, or tags", () => {
    const video = { title: "", description: "", tags: [""] };
    expect(youtube.isStardewRelatedVideo(video)).toBe(false);
  });
});

describe("logAlreadySentMessage", () => {
  test("logs the correct message", () => {
    setupTimeMock();
    jest
      .spyOn(utils, "convertUnixTimestampToReadableTimestamp")
      .mockReturnValue("mocked-readable-timestamp");

    //create notifsChannel object with "name" property being "name"
    //create messageObject with "createdTimestamp" property being "createdTimestamp"
    const notifsChannel = { name: "name" };
    const messageObject = { createdTimestamp: 1234567890 };

    // Spy on console.log
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    youtube.logAlreadySentMessage(notifsChannel, messageObject);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mocked-timestamp] Latest video has already been posted to name channel at mocked-readable-timestamp."
    );
  });
});

describe("getLatestYoutubeVideo", () => {
  let consoleErrorSpy;
  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock getTimeStamp to return fixed value for consistent logs
    setupTimeMock();
    consoleErrorSpy = setupConsoleErrorMock();
  });

  afterEach(() => {
  consoleErrorSpy.mockRestore();
});
  test("logs error and returns null if searchResponse.ok is false", async () => {
    mockFetchOnce(false, { error: { message: "Search API error" } });
    const result = await youtube.getLatestYoutubeVideo();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[mocked-timestamp] Error fetching YouTube search data: Search API error`
    );
    expect(result).toBeNull();
  });

  test("logs error and returns null if searchData.items.length is 0", async () => {
    mockFetchOnce(true, { items: [] });
    const result = await youtube.getLatestYoutubeVideo();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[mocked-timestamp] No videos found for the channel.`
    );
    expect(result).toBeNull();
  });

  test("logs error and returns null if videosResponse.ok is false", async () => {
    const videoId = "12345"
    mockFetchOnce(true, { items: [{ id: { videoId } }] });
    mockFetchOnce(false, { error: { message: "Videos API error" } })

    const result = await youtube.getLatestYoutubeVideo();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[mocked-timestamp] Error fetching meta data for video with the id of ${videoId}: Videos API error`
    );
    expect(result).toBeNull();

    consoleErrorSpy.mockRestore();
  });

    test("logs error and returns null if videosData.items.length is 0", async () => {
      const videoId = "12345";
      // First fetch call for search returns ok:true with a videoId
      mockFetchOnce(true, { items: [{ id: { videoId } }] })

      // Second fetch call for videos metadata returns ok:true but no items
      mockFetchOnce(true, { items: [] });

      const result = await youtube.getLatestYoutubeVideo();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `[mocked-timestamp] No video data found for the video with the id of ${videoId}. Possible issues: The video may have been deleted, the video might private or restricted, or there may be an issue with the YouTube API.`
      );
      expect(result).toBeNull();
    });


  test("returns video data object when all API calls succeed", async () => {
    const videoId = "12345";
    const mockVideoData = {
      videoId,
      title: "Test Video",
      description: "This is a test video description.",
      published: "2023-10-01T00:00:00Z",
      tags: ["test", "video"],
      link: `https://www.youtube.com/watch?v=${videoId}`,
    };

    // Mock the first fetch call for search
    mockFetchOnce(true, { items: [{ id: { videoId: mockVideoData.videoId } }] })

    // Mock the second fetch call for video metadata
    mockFetchOnce(true, {
        items: [
          {
            snippet: {
              title: mockVideoData.title,
              description: mockVideoData.description,
              publishedAt: mockVideoData.published,
              tags: mockVideoData.tags,
            },
          },
        ],
      })

    const result = await youtube.getLatestYoutubeVideo();

    expect(result).toEqual(mockVideoData);
  });
});
