# Stardew Discord Bot - Project Plan

## 1. Project Overview / Introduction
This project aims to develop a Discord bot for Hawker’s (Kovu’s) Stardew Mod Discord server.  
The bot will send notifications to appropriate channels when Hawker uploads a video, starts a stream, or uploads/updates a mod. This will automate notifications so that moderators don’t need to manually monitor these sites.

---

## 2. Objectives
- Automate content-based notifications to reduce manual moderator workload.
- Ensure timely pings to users when new content (streams, videos, mods) is published.
- Maintain a reliable and always-on bot presence to ensure no notifications are missed.
- Provide a safe environment to test new features without disrupting the live server.

---

## 3. Functional Requirements
- The bot shall send a notification in a specified channel and role when Hawker starts a Twitch stream.
- The bot shall send a notification in a specified channel and role when a new YouTube video is uploaded by Hawker.
- The bot shall detect and ping users when a new beta build is available on GitHub.
- The bot shall send a notification when a new version of the mod is released on Nexus Mods.
- The bot shall send a notification when a new Stardew mod is released on Nexus Mods.

---

## 4. Non-Functional Requirements
- The bot must ensure at least 99.9% uptime (except for scheduled maintenance).
- The bot should have a staging (test) version for verifying new features before deploying them on the main version.

---

## 5. Technology Stack
- **Backend**: Discord.js (Node.js)
- **Hosting**: Local Laptop

---

## 6. Epics and User Stories

### Epic 1: Twitch Integration
| **Name**                         | **Description**                                                                | **User Story**                                                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.1 - Stardew Twitch Streams** | Notify in “stream-notifs” channel when Hawker streams **Stardew Valley**.      | As a Discord user with the “Stardew Stream notifs” role, I want to be notified in the “stream-notifs” channel when Hawker goes live on Twitch about a stream related to Stardew so that I can join the stream live            |
| **1.2 - Other Twitch Streams**   | Notify in “stream-notifs” channel when Hawker streams **non-Stardew** content. | As a discord user with the “Other Stream notifs” role, I want to be notified in the “stream-notifs” channel when Hawker goes live on Twitch about a stream that is not related to Stardew so that I can join the stream live. |

#### 1.1 - Stardew Twitch Acceptance Criteria
- [x] Given Hawker starts stream on Twitch:
  - [x] If the stream title contains the word “Stardew” (regardless of capitalization), the bot will not detect the stream.
  - [x] If the stream has the tag “Stardew” or “Stardew Valley” (regardless of capitalization), the bot will not detect the stream.
  - [x] If the stream’s game category is set to “Stardew Valley” (regardless of capitalization), the bot will not detect the stream.
  - [x] The bot shall should detect streams that do not meet any of the above criteria
  - [x] When a stream starts, the bot pings “Other Stream notifs” in the “stream-notifs” channel
  - [x] The message a link to the stream and a custom message “Hawker is live: ” followed by the name of the stream in bolded letters
  - [x] The bot must not duplicate pings for the same stream session.

#### 1.2 - Other Twitch Streams Acceptance Criteria
- [x] Given Hawker starts stream on Twitch
  - [x] If the stream title contains the word “Stardew” (regardless of capitalization), the bot will not detect the stream
  - [x] If the stream has the tag “Stardew” or “Stardew Valley” (regardless of capitalization), the bot will not detect the stream
  - [x] If the stream’s game category is set to “Stardew Valley” (regardless of capitalization), the bot will not detect the stream
  - [x] The bot shall detect streams that do not meet any of the above criteria
  - [x] When a stream starts, the bot pings “Other Stream notifs” in the “stream-notifs” channel
  - [x] The message includes a link to the stream and a custom message “Hawker is live: ” followed by the name of the stream in **bolded letters**
  - [x] The bot must not duplicate pings for the same stream session
---

### Epic 2: YouTube Integration
| **User Story**                              | **Description**                                                                   | **User Story**                                                                                                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1 - Stardew YouTube Videos** | Notify in “upload-notifs” channel when Hawker uploads **Stardew-related** videos. | As a Discord user, I want to be notified when a new video related to Stardew Valley is uploaded to Hawker’s YouTube channel, so I can watch the content as soon as possible.                                         |
| **2.2 - Other YouTube Videos**   | Notify in “upload-notifs” channel when Hawker uploads **non-Stardew** videos.     | As a Discord user with the “Other Upload notifs” role, I want to be notified when a new video not related to Stardew Valley is uploaded to Hawker’s YouTube channel, so I can watch the content as soon as possible. |
#### 2.1 - Stardew YouTube videos Acceptance Criteria
- [x] Given Hawker makes a video public on their YouTube channel
  - [x] If the video has the word “Stardew” (regardless of capitalization) in the title, the bot shall detect the video
  - [x] If the video has the word “Stardew” (regardless of capitalization) in the description, the bot shall detect the video
  - [x] If the video has the word “Stardew” (regardless of capitalization) as a tag, the bot shall detect the video
  - [x] If the video has the game “Stardew Valley” attached to it, the bot shall detect the video
  - [x] The bot should not detect videos that do not meet any of the above criteria
- [x] When the bot detects a video, the bot pings “Stardew Upload notifs” in the “upload-notifs” channel
- [x] The message includes a link to the video, and a custom message “Hawker has uploaded a new video: ” followed by the name of the video in **bolded letters**
- [x] The bot should avoid duplicate notifications for the same video

#### 2.2 - Other YouTube videos Acceptance Criteria
- [x] Given Hawker makes a video public on their YouTube channel:
    - [x] If the video has the word “Stardew” (regardless of capitalization) in the title, the bot shall not detect the video
    - [x] If the video has the word “Stardew” (regardless of capitalization) in the description, the bot shall detect the video
    - [x] If the video has the word “Stardew” (regardless of capitalization) as a tag, the bot shall not detect the video
    - [x] If the video has the game “Stardew Valley” attached to it, the bot shall not detect the video
    - [x] The bot should detect videos that do not meet any of the above criteria
    - [x] When the bot detects a video, the bot pings “Other Upload notifs” in the “upload-notifs” channel
    - [x] The message includes a link to the video and a custom message “Hawker has uploaded a new video: ” followed by the name of the video in **bolded letters**
    - [x] The bot should avoid duplicate notifications for the same video
---

### Epic 3: GitHub Monitoring
| **User Story**           | **Description**                                                                                | **User Story**                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **3.1 - ICCC Beta Test** | Notify in “beta-test-release” channel when a **beta** build is released on ICCC’s GitHub repo. | As an ICCC beta tester, I want to be notified when a new beta build is published on Github, so I can test the latest changes. |

#### 3.1 - ICCC Beta Test Acceptance Criteria
- [x] The bot monitors ICCC’s Github repository release
    - [x] When a new release is published with “beta” (not case-sensitive) in the name, a message will be sent in ICCC’s “beta-test-release” channel
    - [x] The message will have the following:
        - [x] The role “ICCC beta tester”
        - [x] A link to the release including the version number and changelog
        - [x] A message notifying users of the release like “Hawker released a new test build for ICC.”
---

### Epic 4: Nexus Mod Releases
| **User Story**                     | **Description**                                                                   | **User Story**                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **4.1 - ICCC Nexus Update**        | Notify in “mod-release-notifs” when ICCC mod is updated on Nexus.                 | As a ICCC mod user, I want to be altered when Hawker adds any new updates to the ICCC mod on Nexus, so I can download the latest version. |
| **4.2 - New Stardew Mods Release** | Notify in “nexus-mod-release-notifs” when new Stardew mods are released on Nexus. | As a mod user, I want to know when Hawker releases a new mod to Nexus, so I can download it.                                              |

#### 4.1 - ICCC Nexus Update Acceptance Criteria
- [x] The bot checks the ICCC page on Nexus regularly for version updates
    - [x] When a new mod version of ICCC is released, the bot sends a message to ICCC’s “mod-release-notifs” channel
    - [x] The message will include:
        - [x] The role “ICCC”
        - [x] A link to the mod on Nexus
        - [x] A message describing the release “A new version of ICCC has been released on Nexus (**version number in bold letters**).”

#### 4.2 - New Stardew Mods Release* Acceptance Criteria
- [x] The bot checks Hawker’s profile to see if they uploaded a new mod
    - [x] If the mod is related to Stardew Valley, the bot will send a message in “nexus-mod-release-notifs”
    - [x] The message will include:
        - [x] The link to the mod on Nexus
        - [x] A custom message like “Hawker has released a new Stardew mod on Nexus”

---

### Epic 5: Staging & Feature Testing
| **User Story**          | **Description**                                                                   | **User Story**                                                                                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **5.1 - Staging**       | Maintain a **staging environment** for safe testing.                              | As a bot developer, I want a staging version of the bot, so I can safely test new features before deployment.                                                                                              |
| **5.2 - Documentation** | Maintain complete onboarding and contribution guidelines in the project’s README. | As a bot maintainer, I want written documentation of the purpose of this project and how onboarding members can contribute to it, so I can have a smooth time incorporating new features into the main bot |

#### 5.1 - Staging Acceptance Criteria
- [x] A separate server that mirrors the official one is created.

- [x] A separate instance of the bot is hosted for testing purposes and is added to the test server.

- [x] When a new feature is in development, it must have unit tests and all unit tests must pass in order to be cleared for deployment.

#### 5.2 - Documentation Acceptance Criteria
- [x] The github repository will have the following branches:
    - [x] **main:** where the deployed version of the bot will be running. Only bot maintainers (currently only Hawker) have push access to this branch. No one is allowed to target this branch with a PR. All features should come off this branch.
    - [x] **development:** where PRs will target. This will be where code reviews will be done. Only one PR will be accepted at a time. Another PR cannot be accepted until the staging branch is up to date with this branch. Only Hawker will accept PRs to this branch.
    - [x] **staging:** where the test version of the bot will be running. This is the last stage of a feature until it’s pushed to main. Only Hawker will have push access to this branch. No one is allowed to target this branch with a PR.
- [x] The project will have a readme that will contain the following:
    - [x] A brief description that explains the purpose of this project
    - [x] A section for people who are interested in the server:
        - [x] A brief description of the server
        - [x] An invite link to the server
        - [x] Images of the bot working
    - [x] A section for people who are interested in developing this bot. This will contain the following:
        - [x] The current node version packages of the project
        - [x] Instructions on how to create a PR:
            - [x] Copy off the main branch
            - [x] Implement your changes
            - [x] Add unit tests (if applicable)
            - [x] Make a PR targeting development
            - [x] PR must have a description briefly explaining the changes
            - [x] If it is a bug fix, there must be steps on how to reproduce the bug, the expected outcome, and the current outcome
            - [x] If it is an additional feature, there must be steps on how to get the feature to work
            - [x] Pictures / gifs are optional, but preferred

---

## 7. Future Features Ideas
- None at the moment