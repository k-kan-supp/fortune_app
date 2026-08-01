import type { Messages } from "./ja";

/** 英語メッセージ。ja.ts と同じキー構成であることを型で保証する。 */
export const en: Messages = {
  app: {
    title: "Four Pillars of Destiny",
  },

  lang: {
    label: "Language",
  },

  nav: {
    discover: "Discover",
    matches: "Matches",
    fortune: "Reading",
    profile: "Profile",
    result: "Your reading",
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
    close: "Close",
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
    modalTitle: "Enter your birth date",
    prefillNote: "We filled this in from your profile.",
    prefillEdit: "Edit",
    resultTitle: "Your chart",
    resultHint:
      "The stems, branches and hidden stems of the four pillars, centred on your day master.",
    registerCta: "Continue to sign-up",
    missingParams: "No birth date was given. Please enter one from the top page.",
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
    chartsTitle: "Balance of your chart",
    chartsHint:
      "Stems and hidden stems are counted with weights, then read ten different ways. The closer to the outer ring, the stronger that element sits in your chart.",
    charts: {
      showValues: "Show the numbers",
      axis: "Axis",
      value: "Value",
      scale: "Outer ring = {{max}}.",
      five_elements: {
        title: "Five elements",
        note: "How strong wood, fire, earth, metal and water are, scored across all four pillars.",
      },
      ten_stems: {
        title: "Heavenly stems",
        note: "The same score split into yin and yang, so the totals match the five elements.",
      },
      twelve_branches: {
        title: "Earthly branches",
        note: "Which branches your four pillars land on. A repeated branch concentrates its energy.",
      },
      ten_gods: {
        title: "Ten gods",
        note: "Each of the ten gods seen from your day master. The largest ones shape how you show up.",
      },
      ten_god_groups: {
        title: "Ten god groups",
        note: "The ten gods folded into five camps: self, output, wealth, power and resource.",
      },
      twelve_stages: {
        title: "Twelve life stages",
        note: "The vitality your day master takes on in each pillar's branch, across the twelve stages.",
      },
      pillar_energy: {
        title: "Pillar energy",
        note: "The year, month, day and hour pillars scored 1–12 by their life stage.",
      },
      seasonal_states: {
        title: "Seasonal strength",
        note: "Where each element stands this season — flourishing, rising, resting, trapped or dormant.",
      },
      personality: {
        title: "Personality",
        note: "Six traits drawn from the mix of ten god groups, on a 0–100 scale.",
      },
      life_areas: {
        title: "Fortune by area",
        note: "The same mix read by life area. Health is measured by how even your five elements are.",
      },
    },
  },

  glossary: {
    heading: "What this means",
    hint: "Tap an axis name to see what it means.",

    table: {
      dayMaster:
        "The heavenly stem of your birth day. It is the main character of the chart — every other stem is read as a ten god relative to it.",
    },

    element: {
      木: "Wood: growing plants. Growth, development and kindness. Wood feeds fire and keeps earth in check.",
      火: "Fire: rising flame. Passion, expression and brightness. Fire feeds earth and keeps metal in check.",
      土: "Earth: the ground that holds everything. Stability, trust and nurture. Earth feeds metal and keeps water in check.",
      金: "Metal: forged blade and ore. Decision, discipline and precision. Metal feeds water and keeps wood in check.",
      水: "Water: a flowing stream. Intellect, flexibility and connection. Water feeds wood and keeps fire in check.",
    },

    stem: {
      甲: "Yang wood. A tall tree growing straight up — firm at the core and driven towards a goal.",
      乙: "Yin wood. Grass and vines — supple, growing by adapting to what is around it.",
      丙: "Yang fire. The sun — bright, outgoing and warming everyone in sight.",
      丁: "Yin fire. A lamp — quiet and attentive, warming the people close by.",
      戊: "Yang earth. A mountain — immovable, supporting everything around it.",
      己: "Yin earth. Field soil — soft and receptive, made for growing things.",
      庚: "Yang metal. A blade or raw ore — decisive, cutting a way through.",
      辛: "Yin metal. A polished jewel — delicate, drawn to beauty and precision.",
      壬: "Yang water. A great river — large in scale, creating the current others follow.",
      癸: "Yin water. Rain and dew — quiet and sensitive, seeping in everywhere.",
    },

    branch: {
      子: "Rat. Mid-winter (around December), direction north. The still period before anything sprouts.",
      丑: "Ox. Late winter (around January). The coldest point, storing strength for spring.",
      寅: "Tiger. Early spring (around February). Things start to move.",
      卯: "Rabbit. Mid-spring (around March), direction east. A calm season of steady growth.",
      辰: "Dragon. Late spring (around April). Change and momentum mixed together.",
      巳: "Snake. Early summer (around May). Heat building up.",
      午: "Horse. Midsummer (around June), direction south. Fire at its strongest.",
      未: "Goat. Late summer (around July). Ripening towards the harvest.",
      申: "Monkey. Early autumn (around August). Fruit begins to firm up.",
      酉: "Rooster. Mid-autumn (around September), direction west. Harvest and finishing.",
      戌: "Dog. Late autumn (around October). Tidying up and turning to defence.",
      亥: "Pig. Early winter (around November). Turning inward and storing energy.",
    },

    tenGod: {
      比肩: "Same element and same polarity as your day master. Yourself and your equals — plenty of it means independence and a strong will.",
      劫財: "Same element, opposite polarity. A rival at your side: drive and boldness, but also spending and friction.",
      食神: "What your day master produces, same polarity. Easy-going expression and comfort in daily life.",
      傷官: "What your day master produces, opposite polarity. Sharp talent and a critical eye, expressed outside the mould.",
      偏財: "What your day master controls, same polarity. Fast-moving money and a wide circle of people.",
      正財: "What your day master controls, opposite polarity. Steady wealth built up honestly.",
      偏官: "What controls your day master, same polarity (Seven Killings). Severity, drive and resilience under pressure.",
      正官: "What controls your day master, opposite polarity. Discipline, trust and social standing.",
      偏印: "What produces your day master, same polarity. Inspiration and an unconventional way of learning.",
      印綬: "What produces your day master, opposite polarity. Knowledge, protection and steady study.",
    },

    tenGodGroup: {
      比劫: "Friend and Rob Wealth together: the 'self' camp — your own strength and your peers.",
      食傷: "Eating God and Hurting Officer together: the 'output' camp — expression and creation.",
      財星: "Indirect and Direct Wealth together: money, tangible results and dealings with people.",
      官殺: "Seven Killings and Direct Officer together: responsibility, discipline and social role.",
      印星: "Indirect and Direct Resource together: learning, support and what you receive.",
    },

    stage: {
      長生: "Growth: just born. The fresh momentum of a beginning.",
      沐浴: "Bath: the first wash. Unsteady and easily swayed, but rich in sensitivity.",
      冠帯: "Cap: coming of age. Confidence forms and you start to step out.",
      建禄: "Prime: standing on your own and working. Solid, reliable strength.",
      帝旺: "Emperor: the peak. The strongest push — with a risk of going too far.",
      衰: "Decline: past the peak and settling down. Steady rather than forceful.",
      病: "Illness: strength fading. Introspective, with delicate sensitivity.",
      死: "Death: movement stops. Quiet thinking and depth in one subject.",
      墓: "Grave: gathering and storing. Collecting, protecting, inheriting.",
      絶: "Void: cut off before the next turn. Big changes and decisiveness.",
      胎: "Conception: just conceived. Potential that has not taken shape yet.",
      養: "Nurture: being raised. Supported by others while quietly building strength.",
    },

    pillar: {
      year: "The year pillar. Childhood, family line, and the first impression society has of you.",
      month: "The month pillar. The centre of the chart: work, social standing and your parents.",
      day: "The day pillar. Yourself and your partner — the keystone of the chart.",
      hour: "The hour pillar. Later life, children, and the wishes you keep to yourself.",
    },

    seasonal: {
      旺: "The element that rules this season — at its strongest right now.",
      相: "The element the ruler produces — rising, next in line.",
      休: "The element that produced the ruler — resting after its work is done.",
      囚: "The element that tries to control the ruler — trapped and unable to act.",
      死: "The element the ruler controls — at its weakest.",
    },

    personality: {
      independence: "How strongly you decide and act on your own, read from the share of the self camp.",
      expression: "How readily you give your ideas a form, read from the share of the output camp.",
      sociability: "How widely you connect with people, read mainly from the wealth camp.",
      action: "How firmly you push a decision through, read mainly from the power camp.",
      discipline: "How well you keep to rules and keep going, read from the power and resource camps.",
      curiosity: "How much you dig into learning, read mainly from the resource camp.",
    },

    lifeArea: {
      career: "How readily work develops for you, from the mix of power, resource and wealth.",
      wealth: "How readily money gathers, from the mix of wealth and output.",
      love: "The strength of romantic ties — wealth is the key star for men, power for women.",
      health: "Measured by how even your five elements are: the more balanced, the higher.",
      relationships: "How smoothly you deal with people, from the self and output camps.",
      study: "How easily learning sinks in, read mainly from the resource camp.",
    },
  },

  compat: {
    title: "Four Pillars compatibility",
    open: "See how you match",
    hint: "Tap the card to see how you match",
    chartsTitle: "What this reading is based on",
    chartsHint:
      "Your two profiles, laid over each other. The shaded wedges are what decided the notes above.",
    you: "You",
    charts: {
      five_elements: "Balance of strengths (behind Support)",
      ten_god_groups: "Habits of thought (behind Way of thinking)",
    },
    axisLabels: {
      木: "Growth",
      火: "Passion",
      土: "Steadiness",
      金: "Resolve",
      水: "Reflection",
      比劫: "Self",
      食傷: "Expression",
      財星: "Enjoyment",
      官殺: "Discipline",
      印星: "Learning",
    },
    facets: {
      body: "Body",
      heart: "Heart",
      mind: "Way of thinking",
      support: "Support",
    },
    facetNotes: {
      body: "Daily rhythm, and how easy it feels to be together",
      heart: "How readily feelings get through, and whether you feel at ease",
      mind: "Whether you see things and make decisions the same way",
      support: "Whether you make up for what the other one lacks",
    },
    notes: {
      "day_master.generates":
        "You are the one who ends up looking after them — giving a push, smoothing the way. Being relied on brings out your best.",
      "day_master.generated":
        "They are the one who props you up. It is easy to lean on them or talk things through, and you relax in their company.",
      "day_master.same_mixed":
        "Alike in outlook, yet good at different things. You agree easily and still cover each other's weak spots.",
      "day_master.same":
        "You think and react in much the same way. That makes things quick, but when you disagree, someone has to give ground on purpose.",
      "day_master.controls":
        "You tend to take the lead here. The pull is yours, so keep an eye on their pace and the pairing stays steady.",
      "day_master.controlled":
        "They tend to come on stronger. Some moments are tense, but this is the person who toughens you up and helps you grow.",
      "branch.six_harmony":
        "You are drawn to each other without trying. The distance closes quickly and time together feels easy.",
      "branch.three_harmony":
        "You naturally face the same way. Goals and tastes line up, and joining forces gets things moving.",
      "branch.same":
        "You sense things alike, which is comfortable. The flip side is that novelty has to come from you two.",
      "branch.clash":
        "You meet head-on. There is no shortage of spark — what decides it is whether you can talk after a clash.",
      "branch.harm":
        "Your day-to-day pace slips out of step easily. Say what you are thinking out loud and the crossed wires drop away.",
      "branch.neutral":
        "Neither pulled together nor pushed apart. You get to set the distance at your own pace.",
      "element.complements":
        "What one of you finds hard, the other covers without effort. Together the balance comes out right.",
      "element.similar":
        "You are good at similar things. The strengths stack up, but so do the blind spots — watch for tripping on the same step.",
      "mind.alike":
        "You weigh things up and decide in much the same way, so you get each other without long explanations.",
      "mind.different":
        "You reason along different lines. It widens the view, as long as you spell out what you are assuming.",
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
