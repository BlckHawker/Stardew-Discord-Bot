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
- **Hosting**: Local Laptop (for now)

---

## 6. Epics and User Stories

### Epic 1: Twitch Integration
| User Story                              | Description                                                                                     |
|-----------------------------------------|-------------------------------------------------------------------------------------------------|
| **User Story 1.1 - Stardew Twitch Streams** | Notify in “stream-notifs” channel when Hawker streams **Stardew Valley**.                        |
| **User Story 1.2 - Other Twitch Streams**  | Notify in “stream-notifs” channel when Hawker streams **non-Stardew** content.                   |

---

### Epic 2: YouTube Integration
| User Story                               | Description                                                                                     |
|------------------------------------------|-------------------------------------------------------------------------------------------------|
| **User Story 2.1 - Stardew YouTube Videos** | Notify in “upload-notifs” channel when Hawker uploads **Stardew-related** videos.                |
| **User Story 2.2 - Other YouTube Videos**  | Notify in “upload-notifs” channel when Hawker uploads **non-Stardew** videos.                    |

---

### Epic 3: GitHub Monitoring
| User Story                                | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| **User Story 3.1 - ICCC Beta Test**         | Notify in “beta-test-release” channel when a **beta** build is released on ICCC’s GitHub repo.  |

---

### Epic 4: Nexus Mod Releases
| User Story                                | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| **User Story 4.1 - ICCC Nexus Update**     | Notify in “mod-release-notifs” when ICCC mod is updated on Nexus.                               |
| **User Story 4.2 - New Stardew Mods Release** | Notify in “nexus-mod-release-notifs” when new Stardew mods are released on Nexus.                |

---

### Epic 5: Staging & Feature Testing
| User Story                                | Description                                                                                     |
|-------------------------------------------|-------------------------------------------------------------------------------------------------|
| **User Story 5.1 - Staging**                | Maintain a **staging environment** for safe testing.                                             |
| **User Story 5.2 - Documentation**         | Maintain complete onboarding and contribution guidelines in the project’s README.                |

---

## 7. Planned Future Features (Ideas / Backlog)
- **Role opt-out system**: Allow users to opt-out of specific notification roles.
- **`/status` command**: Show if the bot is online and which modules are running.
- **Dependency Notifications**: Notify when one of Hawker’s mods has a dependency update on Nexus Mods.
- **Web Dashboard** (Long-term goal): Web interface for admins to configure bot settings and notifications.
- **Command to view last 5 mods uploaded by Hawker on Nexus Mods.**

---

## 8. Contribution Workflow
### Branches:
- **`main`** → Production. No PRs allowed. Hawker-only.
- **`development`** → PRs target this. Where code reviews happen.
- **`staging`** → Where the test bot runs. Updated before merging to `main`.

### PR Requirements:
1. Branch from `main`
2. Make your changes with **unit tests**
3. PR → target **`development`**
4. Include:
   - Summary of changes
   - For bug fixes: reproduction steps, expected vs. actual behavior
   - For features: how to use feature
   - Screenshots/gifs (optional but preferred)

---

## 9. Repository README Checklist
The README must include:
- ✅ Project description
- ✅ Description of the Discord server (with invite link)
- ✅ Images/screenshots of the bot working
- ✅ Contribution guide (with Node version + dependencies)
- ✅ PR instructions and standards

---