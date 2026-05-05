import { sharedSettings } from "./sharedSettings";
import merge from "lodash/merge";

// Local-development settings for the World Daemons forum type.
// Activated by ENV_NAME=localWdDevDb FORUM_TYPE=WorldDaemons.
//
// Identity strings (title, tagline, names) are final-ish; visual assets
// (logo, favicon, siteImage) are placeholders until the design pass lands.
// See ROADMAP.md (Phase B) and REBRAND_NOTES.md in the world-daemons repo.

export const localWdDevDb = merge({
  forumType: "WorldDaemons",
  title: "World Daemons",
  tagline: "A forum for the next wave of AI, philosophy, and adjacent strange ideas.",
  logoUrl: "/branding/wd-logo-placeholder.svg",
  siteNameWithArticle: "World Daemons",
  aboutPostId: "dummyId",
  faqPostId: "dummyId",
  contactPostId: "dummyId",
  faviconUrl: "/branding/wd-favicon-placeholder.svg",
  faviconWithBadge: "/branding/wd-favicon-placeholder.svg",
  forumSettings: {
    headerTitle: "WORLD DAEMONS",
    shortForumTitle: "WD",
    tabTitle: "World Daemons",
  },
  analytics: {
    environment: "localhost",
  },
  testServer: true,
  debug: false,
  ckEditorOverride: {
    uploadUrl: "https://39669.cke-cs.com/easyimage/upload/",
    webSocketUrl: "wss://39669.cke-cs.com/ws",
  },
  // No crosspost target for World Daemons.
  fmCrosspost: { siteName: "World Daemons", baseUrl: "http://localhost:3000/" },
  expectedDatabaseId: "development",
  performanceMetricLogging: {
    enabled: true,
    batchSize: 10,
    sqlSampleRate: 0.05,
  },
}, sharedSettings);
