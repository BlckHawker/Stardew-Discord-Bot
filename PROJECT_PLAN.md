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
- Maintain high code quality through ESLint rules, test coverage, and file documentation
- Improve Discord bot interaction through message handling, caching, and verification.

---

## 3. Functional Requirements
- The bot shall send a notification in a specified channel and role when Hawker starts a Twitch stream.
- The bot shall send a notification in a specified channel and role when a new YouTube video is uploaded by Hawker.
- The bot shall detect and ping users when a new beta build is available on GitHub.
- The bot shall send a notification when a new version of the mod is released on Nexus Mods.
- The bot shall send a notification when a new Stardew mod is released on Nexus Mods.
- The bot shall support deleting large numbers of Discord messages within any (or all) channels at once.
- The bot shall support GitHub PR integration with templates and CI tests.
- The bot shall support test coverage tracking and enforce consistent testing structure
- The bot shall verify and cache Discord channel references to reduce API usage

---

## 4. Non-Functional Requirements
- The bot must ensure at least 99.9% uptime (except for scheduled maintenance).
- The bot should have a staging (test) version for verifying new features before deploying them on the main version.
- Code should adhere to ESLint rules and include header/purpose comments
- A project board should be organized to track current tasks and priorities

---

## 5. Technology Stack
- **Backend**: Discord.js (Node.js)
- **Testing**: Jest for unit testing
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
### Epic 6: GitHub and Webkooks & CL Workflow
| Name | Description | **User Story**                                                                                                                                                                         
| **Name**                 | **Description** | **User Story**                                                                                                                                                                                                                                             |
| ------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 - GitHub Integration | Send updates to Discord channels when any tracked GitHub repository changes.  | As a contributor to one of Hawker’s mods, I want to receive Discord notifications whenever activity occurs on the associated GitHub repository (such as commits, issues, or pull requests), so I can stay up to date and avoid working on outdated code. |
| 6.2 - PR Templates       | Provide standardized pull request templates for features and bug fixes.      | As a developer, I want standardized pull request templates for features and bug fixes, so I can provide clear, consistent information about my changes and help reviewers understand, test, and approve my work efficiently.                                                                                                  |                                            
#### 6.1 - GitHub Integration Acceptance Criteria
- [ ] For each of Hawker's Stardew mod repositories, there will be a respective discord channel where the GitHub Webhook will send messages to when anything changes on that repository
- [ ] The following mods will get a Discord channel
  - [ ] Instant Community Center Cheat (ICCC)
  - [ ] Perfectionist Interactive Guide

#### 6.2 - GitHub Integration Acceptance Criteria
- [ ] On GitHub, there will PR templates for bugs and new features.
- [ ] The new features template will ask for the following:
   - [ ] Very specifc steps on how to use the feature. With a note stating the more details included, the better to understand the purpose of the PR.
- [ ] The bugs template will ask for the following:
  - [ ] Very specifc steps on how to reporduce the bug. With a note stating the more details included, the better to understand the purpose of the PR.
  - [ ] The expected behavoir from the repoduced steps
  - [ ] The actual behavior from the reproduced steps
- [ ] Both templates will ask for the following:
  - [ ]  Summary - A breif description of what the PR entails
  - [ ] Additional notes - Any additional notes the user thinks it's good for other devs to note. Such very rare edge cases. A feature being half completed ecetera (optinal)
  - [ ] Media: - Include screenshots or GIFs if available (optional)
  - [ ] A checklist that will be for the user to verify that they have implemented so their code follows standards
    - [ ] Verify all functions (either created or modified) have headers that explain their purpose, the paramters' type, paraamter's purpose, and return value of function
    - [ ] Unit tests that cover new/modified code
    - [ ] Code formatted to match project's standards
    - [ ] No spelling mistakes within code (including comments)
- [ ] In the readme, there will be a reference to both of these templates.
  - [ ] new feature template
  - [ ] bugs template
---
### Epic 7: Logging & Console Output
| Name  | Description | User Story  |
|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 7.1 - Console and Discord Logging | Enable bot logs to be saved and forwarded to a Discord channel.  | As a maintainer, I want the bot to send its console logs to a dedicated discord server so I can more easily see the bot's status, and more quickly fix it if the bot runs into an error. As a maintainer, I want the bot to send its console logs to a dedicated discord server so I can more easily see the bot's status, and more quickly fix it if the bot runs into an error. |
| 7.2 - Logging Utilities  | Provide reusable logging helpers.  | As a contributor, I want helper log functions so I am not repeating the same code frequently. |
#### 7.1 - Console and Discord Logging Acceptance Criteria
- [ ] There will be a logging function that sends logs to a dedicated Discord channel
- [ ] Anything that is printed to the console will also be printed to a local text file
   - [ ] The content of the text field will be sent to a dedicated Discord channel at 12:00:00 AM (timezone depending on the server. At the time of writing, it will be EDT/EST depending on daylight savings.)
   - [ ] A message will be sent pinging the channel of the text file
   - [ ] The text file will be named "log.YYY-MM-DD HH-MM-SS.txt" with the letters being date and time the log was uploaded
  - [ ] The text file is cleared when one of the following happens
   - [ ] The bot is initalized
   - [ ] The bot sends the file to Discord
- [ ] If possible, console and discord logs will be color coded:
  - [ ] Anything logs errors will be red
  - [ ] Any console logs that state something happen successfully will be white
  - [ ] Any console logs that state something failed, but is not a console error will be yellow

#### 7.2 - Logging Utilities Acceptance Criteria
- [ ] Create a helper method to format console error messages.
- [ ] Create a helper method to format console log messages.
---
### Epic 8: Testing & Code Coverage
| Name                               | Description | User Story                                                                                                                                                                                             |
|------------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 8.1 - Comprehensive Unit Testing   | Ensure all logic is covered by unit tests. | As a developer, I want every function (including utility functions) to have at least one unit test, so that I can ensure the proper behavior of my code                                                |
| 8.2 - Automated Coverage Reports   | Generate test coverage reports via CI and scripts.  | As a developer, I want Jest to generate code coverage reports both manually and automatically, so that I can review test completeness on-demand and as part of the PR process.                         |
| 8.3 - Quality Checks for PRs       | Block merges that fail coverage or testing standards.  | As a maintainer, I want PRs to be automatically blocked from merging if they do not meet test coverage and quality standards, so that the codebase maintains a high level of tested and reliable code. |
| 8.4 - Standardize Function Exports | Ensure functions are exported consistently.  | As a developer, I want all function calls within the same file to use `module.exports`, so that functions can be imported, mocked, and tested individually without ambiguity.                          |
| 8.5 - Eliminate Redundant Mocks    | Refactor duplicate mock logic in tests.  | As a developer, I want to refactor tests to remove redundant fetch mocks, so that my test suite is easier to maintain.                                                                                 |

#### 8.1 - Comprehensive Unit Testing Acceptance Criteria
- [ ] Every function and utility in the codebase has an associated unit test.
- [ ] No function is left without at least one test case.

#### 8.2 - Automated Coverage Reports Acceptance Criteria
- [ ] A script exists that generates a Jest coverage report when run manually.
- [ ] The CI/CD pipeline automatically generates and attaches a Jest coverage report when an active PR is created or updated.
- [ ] The Jest tool is used to display the code coverage metrics.

#### 8.3 - Quality Checks for PRs Acceptance Criteria
- [ ] If a PR lacks of the following requirements, it cannot be merged until the issues are resolved
  - [ ] The CI/CD process checks that each PR has at least 90% test coverage.
  - [ ] The merge is automatically blocked if any tests fail.

#### 8.4 - Standardize Function Exports Acceptance Criteria
- [ ] All internal function calls in a file are refactored to use module.exports.
- [ ] Functions are individually importable and mockable within test files.

#### 8.5 - Eliminate Redundant Mocks Acceptance Criteria
- [ ] Any tests that require fetch mocking must use a single, shared configuration. Only functions that actually make HTTP request calls should reference this centralized mock.
- [ ] Remove all fetch mocks from tests for functions that do not perform network calls. Each test should only include fetching behavior if the function under test explicitly depends on it.
---
### Epic 9: ESLint & Style Consistency
| Name                | Description | User Story                                                                                                                                                                                       |
|---------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 9.1 - Linting Rules | Enforce style and documentation via ESLint.  | As a developer, I want to enforce code style and documentation consistency using ESLint, so that all contributions follow agreed-upon standards and are automatically validated in pull requests |
#### 9.1 - Linting Rules Acceptance Criteria
- [ ] Implement ESLint rules for style consistency.
 - [ ] Enforce function header comments via linting.
 - [ ] Detect and flag `// TODO comments` via ESLint.
 - [ ] Enforce purpose comments at the top of all files.
 - [ ] Restrict line length to 80 characters max.
 - [ ] Verify spelling.
 - [ ] If any of the above is false, block pr merge.
- [ ] These checks are ran automatically when an open PR is created/updated.
---
### Epic 10: Nexus Logic Improvements
| Name                      | Description | User Story                                                                                                                                                             |
|---------------------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 10.1 - Code Refactoring   | Refactor the Nexus logic for maintainability.  | As a developer, I want to refactor the ICCC Nexus mod release logic so that the Nexus logic becomes more modular, maintainable, and reusable for other mods.           |
| 10.2 - Edge Case Handling | Handle edge cases in Nexus mod logic.  | As a developer, I want to ensure edge cases in the Nexus logic are handled so that the system handles unexpected scenarios gracefully and maintains reliable behavior. |
#### 10.1 - Code Refactoring Acceptance Criteria
- [ ] Refactor ICCC Nexus mod release logic into a generic helper to be used by other mods.
- [ ] Break `nexus.js` into classes/modules like `NexusModFetcher`, `DiscordAnnouncer`, and `CacheHandler`
#### 10.2 - Edge Case Handling Acceptance Criteria
- [ ] If there is a duplicate message about a beta release, but not follow up job scheduled, make one.
- [ ] `nexus.test.js` line 224 "idk why but just setting variables as "ICCC_NEXUS_MOD_ID" causes them to be undefined. possibly need to set ICCC_NEXUS_MOD_ID inside this describe's before each"
---
### Epic 11: Discord Message Handling
| Name                                           | Description | User Story                                                                                                                                                            |
|------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 11.1 - Bulk Message Purge                      | Provide a tool to clear all test server messages.  | As a developer, I want a script that can purge all messages across all channels, so I can easily reset my test server.                                                |
| 11.2 - Message Retrieval                       | Enable complete message history fetching.  | As a developer, I want to implement a method to fetch all messages in a channel, not just the latest 100, so that I can reliably retrieve complete message histories. |
| 11.3 - Discord Message Fetching Error Handling | Add error-handling around message retrieval.  | As a developer, I want to add error handling when fetching Discord messages in getDiscordMessages, so that the process gracefully handles errors.                      |

#### 11.1 - Bulk Message Purge Acceptance Criteria
- [ ] Script to purge all messages across all channels

#### 11.2 - Message Retrieval Acceptance Criteria
- [ ] Implement method to fetch all messages in a channel, not just the latest 100

#### 11.3 - Discord Message Fetching Error Handling Acceptance Criteria
- [ ] Add error handling when fetching Discord messages in `getDiscordMessages`
---
### Epic 12: Channel Caching & Verification
| Name                             | Description | User Story                                                                                                                                                         |
|----------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 12.1 - Caching                   | Cache channel objects to reduce API usage.  | As a developer, I want to cache channel objects so I minimizes the amount of unnecessary network requests.                                                         |
| 12.2 - Channel Type Verification | Validate channel types and handle failures.  | As a developer, I want to ensure that all Discord channel interactions are wrapped in try-catch blocks, so that the application handles channel errors gracefully. |

#### 12.1 - Caching Accepteance Criteria
- [ ] Cache channel objects to reduce redundant API calls.
- [ ] Create helper method to retrieve and verify cached channel objects.
#### 12.2 - Channel Type Verification Accepteance Criteria
- [ ] Ensure all Discord channel interactions are wrapped in try-catch blocks.
- [ ] Add validation that channels are text-based before interacting with them.
---
### Epic 13: General Refactoring & Clean-up 
| Name                              | Description | User Story                                                                                                               |
|-----------------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------|
| 13.1 - Code Simplification        | Refactor code for clarity and consistency.  | As a developer, I want to streamline our codebase so that our code remains consistent, maintainable, and reliable.       |
| 13.2 - Scheduling Cleanup         | Organize cron job timing for easier debugging. | As a developer, I want to refactor cron jobs to run one minute apart so logs for seperate jobs are easier to read.       |
| 13.3 - Comments and Documentation | Improve documentation across codebase. | As a onboarded member, I want the detailed documentation, so that I have an easier time undertanding the code structure. |
| 13.4 - Logging Enhancements       | Improve log readability. | As a developer, I want to log channel types by name instead of numeric codes, so that.                                   |

#### 13.1 - Code Simplification Acceptance Criteria
- [ ] Change `TWITCH_USER_ID` env var to use the Twitch username instead.
- [ ] Refactor exports to remove test-only exports.
- [ ] Add helper function to verify if a resolved promise status code starts with 2.
#### 13.2 - Scheduling Cleanup Acceptance Criteria
- [ ] Refactor cron jobs to run one minute apart (using a loop). Limit to 60 max.
  - [ ] If more than 60 jobs are given, log an error stating:
    - [ ] The number of jobs given
    - [ ] Only 60 jobs will be done
#### 13.3 - Comments and Documentation Acceptance Criteria
- [ ] Add header comments to all functions.
- [ ] Explain the purpose and editing guidelines of `project_plan.md` and `changelog.md` docs in the README.
#### 13.4 - Logging Enhancements Acceptance Criteria
- [ ] Log channel types by name instead of numeric codes.
---
### Epic 14: Stream Title Sync

| Name                          | Description | User Story                                                                                                                                                                    |
|-------------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 14.1 - Stream Message Updates | Update Discord messages when the Twitch stream title changes.  | As a developer, I want to edit the Discord message to reflect the new stream Twitch title when it changes, so that the message always displays the current and correct title. |
#### 14.1 - Stream Message Updates Acceptance Criteria
- [ ] If the stream Twitch title changes, edit the message to have the new title
---
### Epic 15: API Rate Limiting and Call Scheduling

| Name                      | Description                                                                  | User Story                                                                                                                                                                  |
|---------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 15.1 - Smart API Throttling | Implement cooldown timers per API to respect rate limits and avoid throttling | As a developer, I want my program to automatically manage cooldowns between API calls, so I avoid hitting the free usage limit and ensure reliable operation over time.    |

#### 15.1 - Smart API Throttling Acceptance Criteria

- [ ] Each of the following services is handled independently with its own cooldown logic:
  - [ ] YouTube
  - [ ] Twitch
  - [ ] Nexus Mods
  - [ ] GitHub

- [ ] When a function needs to make an API call:
  - [ ] It calculates the required delay (based on the API's rate-limit window. will be set manually).
  - [ ] If no timer is set, the call proceeds and a cooldown is initiated.
  - [ ] If a timer is active, the call is delayed until the cooldown expires.
  - [ ] Once the timer expires, the next pending call is executed and a new timer is set.

- [ ] Logging:
  - [ ] If a call is throttled, a message is logged with a reason (e.g., “Delaying GitHub call for 3 seconds due to rate limit”).
  - [ ] Log includes which API the wait applies to and the time remaining.

- [ ] This functionality is abstracted into a shared utility module.

# 7. Backlogged Features
- [ ] Refactor any strings that are wrapped around backticks but no placeholder information with quotes.
- [ ] Jest utils functions. To remove similar/duplicate test functions.
- [ ] Break other files into `Fetcher`, `CacheHandler`, etc. Possibly making more utils functions that will be used in other files
- [ ] Possibly change utils to be different modules that have more specific functions
- [ ] Guidelines on how to create an issue. Possibly make a template
- [ ] Verify that all `main` and `staging` cannot be targeted from a PR