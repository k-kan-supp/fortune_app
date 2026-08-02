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

    summary: {
      eyebrow: "Your kind",
      basis: "Day master {{stem}} ({{element}}) × leading camp {{group}}",
      share: "The leading camp holds {{share}}% of the chart",
      peaksTitle: "Where this chart runs high",
      elementPeak: "Thickest element",
      traitPeak: "Highest trait",
      areaPeak: "Highest life area",
      typeCount: "One of 25 kinds",
    },

    sanmei: {
      title: "Body star chart (Sanmeigaku)",
      hint: "The same chart read as Sanmeigaku stars. Tap a cell for what that star means.",
      centerLabel: "Centre star",
      energyTotal: "Three life-stage stars total {{total}} points",
      energyUnit: "{{energy}} pts",
      pick: "Choose a cell.",
      basis: "from the {{source}}",
      positions: {
        head: { label: "Head (north)", role: "Elders, father, work" },
        chest: { label: "Chest (centre)", role: "Your core — the star at your centre" },
        belly: { label: "Belly (south)", role: "Juniors, children, subordinates" },
        left_hand: { label: "Left hand (east)", role: "Spouse and home" },
        right_hand: { label: "Right hand (west)", role: "Friends, siblings, society" },
      },
      periods: {
        early: { label: "Early", range: "From birth until you enter the world" },
        middle: { label: "Middle", range: "From entering the world until you step back" },
        late: { label: "Late", range: "From stepping back onward" },
      },
      sources: {
        year_stem: "year stem",
        month_stem: "month stem",
        year_hidden: "hidden stem of the year branch",
        month_hidden: "hidden stem of the month branch",
        day_hidden: "hidden stem of the day branch",
      },
    },

    compatMap: {
      title: "Compatibility with the 25 kinds",
      hint: "How the 25 kinds sit relative to each other, seen from you ({{name}}). The outer ring is 100. Tap an axis for that partner's score.",
      radarTitle: "Compatibility with the 25 kinds, seen from {{name}}",
      axisGroups: "Axes are grouped by element — wood, fire, earth, metal, water, five kinds each.",
      mapTitle: "The full 25 × 25 map",
      mapHint: "Rows are the viewer, columns the partner. Each row is stretched to 0–100 on its own, so shades cannot be compared across rows. Tap a cell for that pair's score.",
      low: "Low {{value}}",
      high: "High {{value}}",
      meanLabel: "Warm/cool splits at your row mean, {{value}}",
      summary: {
        element: {
          same: "Both sit in {{a}}. The same energy makes you quick to understand each other, and just as quick to stall in the same places.",
          generates: "Your {{a}} produces their {{b}}. You tend to end up on the giving, supporting side.",
          generated: "Their {{b}} produces your {{a}}. You tend to end up on the receiving, supported side.",
          controls: "Your {{a}} controls their {{b}}. You tend to be the one pushing.",
          controlled: "Their {{b}} controls your {{a}}. You tend to be the one pushed.",
        },
        group: {
          same: "Both lead with {{a}}, so your force goes to the same place.",
          different: "You lead with {{a}} and they with {{b}}, so your force goes to different places.",
        },
        band: {
          high: "This is one of the higher pairings among the 25 ({{value}} against an overall mean of {{mean}}).",
          mid: "This is an average pairing among the 25 ({{value}} against an overall mean of {{mean}}).",
          low: "This is one of the lower pairings among the 25 ({{value}} against an overall mean of {{mean}}).",
        },
      },
      caveat: "Scores are averages taken by running the compatibility engine across every pair of kinds, then stretched so that the 25 seen from one kind span 0–100. The scale belongs to the row, so the same pair reads differently from the other side. Compatibility between two people is decided by their birth dates, so any given pair will sit above or below this.",
      ranking: "All 25 kinds ranked from {{name}}",
      self: "Yourself",
    },

    species: {
      WS: { name: "Pioneer Sapling", tagline: "Grows from ground nobody has walked on yet." },
      WX: { name: "Blossom Bough", tagline: "Reaches out, then insists on flowering where it can be seen." },
      WG: { name: "Fruiting Branch", tagline: "Turns growth into something you can actually hold." },
      WO: { name: "Upright Trunk", tagline: "Holds itself straight, and others lean on it for that." },
      WL: { name: "Deep-Root Tree", tagline: "Spends underground what it never asks for above." },
      FS: { name: "Lone Flame", tagline: "Borrows no fuel; burns on its own heat." },
      FX: { name: "Beacon Teller", tagline: "Converts its heat into words and hands them over." },
      FG: { name: "Festival Blaze", tagline: "Burns brightest where people gather." },
      FO: { name: "Watchfire Keeper", tagline: "Takes on lighting one chosen place, night after night." },
      FL: { name: "Ember Keeper", tagline: "Spends its strength not on burning big, but on not going out." },
      ES: { name: "Unmoving Rock", tagline: "Staying put is the whole job." },
      EX: { name: "Fertile Field", tagline: "Takes things in and gives them back in another form." },
      EG: { name: "Keeper of the Storehouse", tagline: "Gathers, holds, and releases at the right moment." },
      EO: { name: "Rampart Earth", tagline: "Draws the boundary and guards what is inside it." },
      EL: { name: "Nursery Soil", tagline: "Backs whatever is growing rather than growing itself." },
      MS: { name: "Honed Blade", tagline: "Hammers itself, and stands on its edge alone." },
      MX: { name: "Ringing Bell", tagline: "Every strike becomes a sound that carries." },
      MG: { name: "Bearer of Scales", tagline: "Weighs worth and settles matters where it balances." },
      MO: { name: "Blade of Order", tagline: "Stands without hesitation on the side that enforces the rule." },
      ML: { name: "Polished Mirror", tagline: "Returns what it receives without bending it." },
      AS: { name: "Solitary Current", tagline: "Digs its own channel instead of joining one." },
      AX: { name: "Welling Spring", tagline: "Lets out what rises from inside, unaltered." },
      AG: { name: "Confluence River", tagline: "The more streams it meets, the more water it carries." },
      AO: { name: "Keeper of the Weir", tagline: "Takes on the decision to stop the flow." },
      AL: { name: "Deep Pool", tagline: "Trades movement for depth, and keeps going down." },
    },
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
      strengths: "Strongest",
      weaknesses: "Weakest",
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

    /** 強み・弱みの解説文（ja.ts の narrative と同じキー構造）。 */
    narrative: {
      axisJoin: " and ",
      sentenceJoin: " ",

      high: {
        lead: "Of the {{count}} axes, {{axis}} stands highest, at {{value}} against an outer ring of {{max}}.",
        spread:
          "The average across every axis is {{average}}, so this one sits {{diff}} above it and reaches {{fill}}% of the way to the rim.",
        band: {
          dominant:
            "With this much force gathered in one place, the axis effectively draws the outline of your chart. The trait shows plainly enough that people notice it on first meeting, but your good and bad spells ride on it too, and recovering when it spins uselessly takes time.",
          clear:
            "It sits a clear step above the rest without running away with the chart, which is the easiest height to work with. You almost certainly reach for it without thinking, and you can still choose when to lean on it and when to hold it back. There is room left to grow.",
          slight:
            "The margin is small and the shape is close to flat. Read it as this axis being half a step ahead rather than in a class of its own, because other axes will lead in some situations. Treat it as where to turn when undecided, not as a verdict.",
        },
        counter:
          "The gap to the lowest axis, {{axis}} at {{value}}, is {{gap}} — and that drop is exactly what gives you your shape.",
        counter_flat:
          "The low side is a row of tied axes, so there is no single trough to point at. With one peak standing out, the rest hold level underneath it.",
      },

      low: {
        lead: "Of the {{count}} axes, {{axis}} sits lowest, stopping at {{value}} against an outer ring of {{max}}.",
        spread:
          "The average across every axis is {{average}}, so this one falls {{diff}} short of it and stands at only {{fill}}% of the rim.",
        band: {
          absent:
            "This axis does not appear in your chart at all. Because it is missing outright it rarely feels real to you, and it slides down the list even when it is needed. Rather than mourn what is absent, cover it through another axis or plan from the start to hand it to someone else.",
          scarce:
            "This is a pronounced trough, well below the average of the chart. It is not wholly absent, so deliberate effort will give it shape, but left alone it simply stays dormant. Whether or not you are aware of it makes most of the difference here.",
          modest:
            "Low as it is, it never strays far from the average, so read it as understated rather than as a weak point. Noticing it when the moment calls for it is enough; your time returns more if you spend it raising the axes that already stand high.",
        },
        counter:
          "It runs {{gap}} behind the highest axis, {{axis}} at {{value}}, and that drop is what the imbalance actually consists of.",
        counter_flat:
          "The high side is a row of tied axes with no standing peak. Only the trough is distinct, so filling it in evens out the whole shape.",
      },

      hint: {
        five_elements: {
          strength:
            "A thick share of one element colours both how you spend your energy and how you frame a problem. Where the element fits, you decide quickly; against people or situations it cannot push through, you take the long way round. Choosing the right ground to stand on is what decides the outcome.",
          weakness:
            "A thin element is one you rarely think about until it is suddenly required, which is when the scramble starts. Adding it from outside — working with someone who has it, or covering it with tools and routines — beats trying to thicken it by willpower.",
        },
        ten_stems: {
          strength:
            "The same element behaves differently in its yang and yin forms. A heavy stem means that particular way of expressing the element has become second nature, and it surfaces in the impression you leave, your turns of phrase, even the order in which you pick a task up.",
          weakness:
            "A thin stem means you lean toward the opposite expression within the same element. That is common enough and not a flaw, but rooms that ask for this particular form of the element head-on will feel constraining.",
        },
        twelve_branches: {
          strength:
            "A repeated branch means you were born holding that season's energy in concentration. Matters and people tied to that time of year gather around you easily, and your form lifts each time the season comes round. Pile it too high, though, and the same energy turns inflexible.",
          weakness:
            "A branch missing from your chart simply did not fit into four pillars; it is not a defect. Even so, that season and direction tend to run thin for you, and ventures begun in that stretch of the year take longer to pick up momentum.",
        },
        ten_gods: {
          strength:
            "A plentiful god means your day master's force flows readily in that direction. Requests start arriving in that shape, experience accumulates, and you grow genuinely good at it. The more the chart tilts to one god, though, the more its drawbacks come through with it.",
          weakness:
            "Where a god runs thin is where things fall outside your attention — it shows up as everyone else doing something as a matter of course while you alone skip it. It is a missing habit rather than a lack of ability, so a fixed routine covers it well enough.",
        },
        ten_god_groups: {
          strength:
            "A large share among the five camps means your chart has already settled on where its force is spent. Life choices tend to follow that camp without being forced, and choosing against it tires you out sooner than you expect.",
          weakness:
            "When a camp is small, decisions in that territory get postponed. Nothing collapses, but when a turning point puts the question to you directly, the hesitation runs long. Plan on talking it through with someone you trust.",
        },
        twelve_stages: {
          strength:
            "Four pillars gathered on one stage means you repeat that way of spending momentum through every phase of life. Good spells and bad ones both arrive in the same form, so knowing it in advance as a habit of yours makes the switch quicker.",
          weakness:
            "A stage that never appears is a phase of momentum you have not yet passed through. It is hard to picture, so the feelings of someone standing in it are hard to read, and your own preparation for landing there is thin.",
        },
        pillar_energy: {
          strength:
            "Momentum gathered in one pillar means you find your power in the period and setting that pillar governs. Year covers childhood and outward impression, month your work, day yourself and your partner, hour later life and private wishes — so which pillar leads changes where your strength lands.",
          weakness:
            "A weak pillar is a period or setting where force of will alone will not carry you. Preparation and borrowed hands work better than pushing. It is precisely the territory of the weak pillar that rewards getting ready early.",
        },
        seasonal_states: {
          strength:
            "Measured from the season of your birth month, you hold a thick share of the element in this rank. The season is behind that energy, so matters touching it turn over with less effort, and recognition comes more easily there.",
          weakness:
            "A thin element in this rank means a place with no seasonal backing is thinner still. Forcing it through regardless of timing tends to spin, so either wait for the moment or route around it using another element.",
        },
        personality: {
          strength:
            "This trait stands high among the six because your mix of ten-god camps pushes it forward. Strengths are hardest to notice exactly where they feel ordinary to you, so hold it up against what other people compliment you on.",
          weakness:
            "A low score here says nothing about your character being poor; it says the chart's force is allocated elsewhere. Adding one deliberate move when the situation calls for it lasts far better than straining to raise it.",
        },
        life_areas: {
          strength:
            "A high area means your chart's balance of camps meshes with that part of life. The same effort returns more there, so when you are torn, shifting your time toward this area gets everything else moving too.",
          weakness:
            "A low area does not mean bad luck; it means the chart's force does not naturally point that way. Rather than measuring yourself against others, take the slack you build in a strong area and spend it here.",
        },
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

    mainStar: {
      貫索星: "Same element, same polarity as your day master. The will to hold to a decision, and the stubbornness that comes with it.",
      石門星: "Same element, opposite polarity. Sociability that gathers people into a circle and keeps the peace.",
      鳳閣星: "What your day master produces, same polarity. Unforced expression, and an appetite for play and good food.",
      調舒星: "What your day master produces, opposite polarity. Fine-grained sensitivity and expression honed alone.",
      禄存星: "What your day master controls, same polarity. Open-handed affection and money that moves quickly.",
      司禄星: "What your day master controls, opposite polarity. Steady accumulation and the keeping of a household.",
      車騎星: "What controls your day master, same polarity. Drive that pushes straight ahead, and plain honesty.",
      牽牛星: "What controls your day master, opposite polarity. Taking on honour and duty, and keeping face.",
      龍高星: "What produces your day master, same polarity. A reforming streak, and the urge to go abroad and learn.",
      玉堂星: "What produces your day master, opposite polarity. Scholarship and transmission — knowledge received and taught on.",
    },

    followerStar: {
      天報星: "The star of the unborn child (3 pts). Not yet fixed in form, testing possibilities as it shifts.",
      天印星: "The star of the infant (6 pts). Draws its strength from being helped and loved.",
      天貴星: "The star of the child (9 pts). Gathers the hopes of those around it through plain openness.",
      天恍星: "The star of the youth (7 pts). Pulled by dreams and longing, always wanting to be elsewhere.",
      天南星: "The star of the young adult (10 pts). Momentum and fighting spirit, forward to the point of recklessness.",
      天禄星: "The star of working prime (11 pts). Delivers steadily on ability built up the slow way.",
      天将星: "The star of the summit (12 pts). The largest energy of all, and the standing to lead.",
      天堂星: "The star of the elder (8 pts). Settles matters calmly, on experience rather than force.",
      天胡星: "The star of the sickbed (4 pts). Sharp sensitivity, turned inward and thought through deeply.",
      天極星: "The star of death (2 pts). Returns to nothing once, and gains spiritual depth from it.",
      天庫星: "The star of the tomb (5 pts). Gathers, stores, inherits and researches.",
      天馳星: "The star of departure (1 pt). Speed and devotion run high; the smallest energy of the twelve.",
    },
  },

  compat: {
    title: "Four Pillars compatibility",
    open: "See how you match",
    hint: "Tap the card to see why you match",
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
    empty: "No one to show right now. New people arrive throughout the day.",
    emptyTitle: "That's everyone for now",
    emptyFiltered: "No one matches these filters. Clearing them often turns up more.",
    clearFilters: "Clear the filters",
    readOwn: "Read your own chart",
    emptyNote: "Your own chart shifts day to day, even when you are not looking for anyone.",
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
    openersTitle: "Somewhere to start",
    openersLead: "Your strongest area together is {{facet}}, at {{score}}.",
    openersHint: "Send one as it is, or edit it first.",
    /** Offer a first line that suits whichever area scored highest. */
    openers: {
      body: "Hi! How do you usually spend your days off?",
      heart: "Hi! I read your profile and you seemed easy to talk to.",
      mind: "Hi! It looks like we think about things in a similar way.",
      support: "Hi! We seem to be good at quite different things, which sounds fun.",
      generic: "Hi! Thanks for the match.",
    },
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
    compatibility: "Match",
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
