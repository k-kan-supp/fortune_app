import type { Messages } from "./ja";

/** 英語メッセージ。ja.ts と同じキー構成であることを型で保証する。 */
export const en: Messages = {
  app: {
    title: "Four Pillars of Destiny",
  },

  lang: {
    label: "Language",
    ja: "日本語",
    en: "English",
  },

  nav: {
    discover: "Discover",
    matches: "Matches",
    fortune: "Reading",
    settings: "Settings",
    logout: "Log out",
  },

  common: {
    loading: "Loading…",
    send: "Send",
    cancel: "Cancel",
    save: "Save",
    remove: "Remove",
    unnamed: "No name",
    noImage: "No Image",
    notSelected: "Not selected",
    any: "Any",
    metaSeparator: " · ",
  },

  errors: {
    fetch: "Could not load the data.",
    send: "Could not send that.",
    unknown: "Unknown error",
    generic: "Something went wrong.",
  },

  fortune: {
    heroTitle: "Free Four Pillars Reading",
    heroSub: "Read the four pillars you were born with, from your date of birth.",
    stepBadge: "Step {{n}}",
    steps: {
      input: {
        title: "Enter your birth date",
        body: "Just your date and time of birth. No sign-up needed to get a reading.",
      },
      chart: {
        title: "Read your chart",
        body:
          "See the nature you were born with in the stems, branches and hidden stems " +
          "of the four pillars.",
      },
      meet: {
        title: "Meet people you click with",
        body: "Save your birth date to your profile to find people you are compatible with.",
      },
    },
    startCta: "Get my reading",
    prefillNote: "We filled this in from your profile.",
    prefillEdit: "Edit",
    resultTitle: "Your chart",
    resultHint:
      "The stems, branches and hidden stems of the four pillars, centred on your day master.",
    toProfile: "Profile settings →",
    toRegister: "Sign up to save your birth date →",
    form: {
      dateTitle: "What year, month and day were you born?",
      dateNote: "Use the Gregorian calendar. Your chart is built from this date.",
      year: "Year",
      month: "Month",
      day: "Day",
      timeTitle: "Do you know what time you were born?",
      timeNote: "This sets the hour pillar. If you are not sure, leave it at 12.",
      hour: "Hour",
      submit: "Get my reading",
      submitting: "Reading…",
    },
    table: {
      dayMaster: "Day master",
      yearPillar: "Year pillar",
      monthPillar: "Month pillar",
      dayPillar: "Day pillar",
      hourPillar: "Hour pillar",
      stem: "Heavenly stem",
      branch: "Earthly branch",
      hiddenStems: "Hidden stems",
    },
  },

  register: {
    title: "Sign up",
    hint: "We will email you a sign-up link.",
    submit: "Send sign-up link",
    sending: "Sending…",
    sentHint: "If the email does not arrive, please check your spam folder.",
  },

  verify: {
    verifying: "Confirming your sign-up…",
    successTitle: "You're all set 🎉",
    loggedInAs: "Signed in as {{email}}.",
    toFortune: "Get a reading →",
    errorTitle: "We couldn't confirm that link",
    retry: "Start sign-up again",
    missingToken: "No token was found.",
    failed: "Verification failed.",
  },

  discover: {
    title: "Discover",
    pass: "Skip",
    like: "Like",
    empty: "No one matches these filters. Try widening your search.",
    matchedTitle: "It's a match 🎉",
    matchedBody: "You matched with {{name}}.",
    toMessages: "Send a message",
    keepBrowsing: "Keep browsing",
    someone: "them",
  },

  filter: {
    open: "Filters",
    close: "Close filters",
    gender: "Gender",
    age: "Age",
    minAge: "Min",
    maxAge: "Max",
    area: "Area",
    reset: "Reset",
    apply: "Apply filters",
  },

  matches: {
    title: "Matches",
    empty: "No matches yet. Send a like from Discover to get started.",
    mine: "You: ",
    image: "📷 Photo",
    noMessages: "Say hello",
  },

  chat: {
    back: "← Matches",
    backToList: "← Back to matches",
    noMatch: "No match was specified.",
    placeholder: "Type a message",
    connecting: "Connecting…",
    sendImage: "Send a photo",
    read: "Read",
    imageFailed: "Could not send the photo.",
    connectionError: "A connection error occurred.",
    notConnected: "Not connected. Please wait a moment and try again.",
  },

  chatMenu: {
    menu: "Menu",
    report: "Report",
    block: "Block",
    blockConfirm: "Block this user? Your match and chat will no longer be shown.",
    blockFailed: "Could not block this user.",
    reportTitle: "Report",
    reason: "Reason",
    reasons: {
      inappropriate: "Inappropriate messages",
      impersonation: "Fake account or spam",
      photoMismatch: "Photos don't match the person",
      other: "Other",
    },
    detail: "Details (optional)",
    reportThanks: "Thanks — we've received your report.",
    reportFailed: "Could not send the report.",
  },

  profile: {
    title: "Profile settings",
    blockedLink: "Blocked users",
    toFortune: "← Get a reading",
    saved: "Saved ✓",
    sections: {
      basic: "Basics",
      physical: "Physical",
      details: "About you",
      about: "Introduction",
    },
    fields: {
      displayName: "Display name",
      birthday: "Date of birth",
      birthTime: "Time of birth",
      gender: "Gender",
      height: "Height",
      weight: "Weight",
      bodyType: "Body type",
      bloodType: "Blood type",
      occupation: "Occupation",
      education: "Education",
      prefecture: "Location",
      maritalStatus: "Marital status",
      smoking: "Smoking",
      drinking: "Drinking",
    },
    bioPlaceholder: "Tell people about yourself (up to 1,000 characters)",
  },

  avatar: {
    alt: "Profile photo",
    choose: "Choose a photo",
  },

  blocked: {
    title: "Blocked users",
    empty: "You haven't blocked anyone.",
    unblock: "Unblock",
    unblockFailed: "Could not unblock this user.",
    back: "← Back to settings",
  },

  candidate: {
    age: "{{age}}",
  },

  options: {
    gender: {
      male: "Male",
      female: "Female",
      other: "Other",
    },
    bodyType: {
      slim: "Slim",
      average: "Average",
      muscular: "Athletic / muscular",
      plump: "Curvy",
    },
    bodyTypeShort: {
      slim: "Slim",
      average: "Average",
      muscular: "Athletic",
      plump: "Curvy",
    },
    bloodType: {
      A: "Type A",
      B: "Type B",
      O: "Type O",
      AB: "Type AB",
    },
    education: {
      high_school: "High school",
      vocational: "Vocational school",
      junior_college: "Junior college",
      university: "University",
      graduate: "Graduate school",
    },
    maritalStatus: {
      single: "Single",
      married: "Married",
      divorced: "Divorced",
    },
    smoking: {
      no: "Non-smoker",
      yes: "Smoker",
      sometimes: "Occasionally",
      quit: "Quit",
    },
    drinking: {
      no: "Doesn't drink",
      yes: "Drinks",
      sometimes: "Occasionally",
    },
  },
};
