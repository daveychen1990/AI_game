import type {
  ActionId,
  Archetype,
  DecisionCard,
  EventCard,
  FactionStatus,
  GameAction,
  RegionNode
} from "./types";

export const START_REGION_IDS = ["boston-harbor", "philadelphia-charter", "appalachian-gate"] as const;

export const MAP_REGIONS: RegionNode[] = [
  {
    id: "boston-harbor",
    name: "波士顿港",
    kind: "harbor",
    tags: ["coastal", "assembly", "harbor"],
    value: 4,
    defense: 8,
    x: 180,
    y: 145,
    neighborIds: ["hudson-valley", "philadelphia-charter"],
    narrative: "新英格兰的港口与街巷里，税单、茶箱与流言比海风更先靠岸。"
  },
  {
    id: "hudson-valley",
    name: "哈德逊河谷",
    kind: "city",
    tags: ["river", "inland", "mercantile"],
    value: 5,
    defense: 9,
    x: 280,
    y: 170,
    neighborIds: ["boston-harbor", "philadelphia-charter", "great-lakes-fort"],
    narrative: "河谷掌着商路与兵道，谁握住这里，谁就握住北方咽喉。"
  },
  {
    id: "philadelphia-charter",
    name: "费城议约地",
    kind: "city",
    tags: ["assembly", "urban", "charter"],
    value: 6,
    defense: 8,
    x: 275,
    y: 255,
    neighborIds: ["boston-harbor", "hudson-valley", "virginia-tidewater", "appalachian-gate"],
    narrative: "印刷机、议约书与私下结盟在这里交错，温和与野心同样危险。"
  },
  {
    id: "virginia-tidewater",
    name: "弗吉尼亚潮水区",
    kind: "harbor",
    tags: ["coastal", "plantation", "gentry"],
    value: 5,
    defense: 7,
    x: 285,
    y: 360,
    neighborIds: ["philadelphia-charter", "carolina-backcountry", "appalachian-gate"],
    narrative: "种植园与河口财富支撑着当地精英，也滋养了傲慢与猜疑。"
  },
  {
    id: "appalachian-gate",
    name: "阿巴拉契亚关口",
    kind: "frontier",
    tags: ["frontier", "mountain", "gateway"],
    value: 3,
    defense: 7,
    x: 415,
    y: 305,
    neighborIds: ["philadelphia-charter", "virginia-tidewater", "great-lakes-fort", "mississippi-trade"],
    narrative: "山道像一把半开的锁，通向西部财富，也通向每个帝国都想吞下的边疆。"
  },
  {
    id: "great-lakes-fort",
    name: "五大湖堡线",
    kind: "fort",
    tags: ["fort", "frontier", "lake"],
    value: 4,
    defense: 11,
    x: 485,
    y: 155,
    neighborIds: ["hudson-valley", "appalachian-gate", "mississippi-trade"],
    narrative: "法英旧战留下的堡垒与空仓，让每一封军报都带着火药味。"
  },
  {
    id: "mississippi-trade",
    name: "密西西比贸易站",
    kind: "trade",
    tags: ["river", "trade", "frontier"],
    value: 5,
    defense: 9,
    x: 575,
    y: 295,
    neighborIds: ["appalachian-gate", "great-lakes-fort", "carolina-backcountry"],
    narrative: "沿河皮货、粮食与情报一道流动，谁掌握它，谁就能把边疆变成帝国脉搏。"
  },
  {
    id: "carolina-backcountry",
    name: "卡罗来纳腹地",
    kind: "frontier",
    tags: ["forest", "frontier", "settlement"],
    value: 4,
    defense: 6,
    x: 450,
    y: 425,
    neighborIds: ["virginia-tidewater", "mississippi-trade"],
    narrative: "林地居民敬畏秩序，却更敬畏饥荒与刀枪。"
  }
];

export const AVAILABLE_ACTIONS: GameAction[] = [
  {
    id: "expand",
    label: "扩张远征",
    summary: "向相邻据点施压并发起战略层远征。"
  },
  {
    id: "govern",
    label: "整饬政务",
    summary: "巩固财政、供给与民心。"
  },
  {
    id: "diplomacy",
    label: "列强博弈",
    summary: "操弄议会、列强与边疆盟约。"
  },
  {
    id: "trade",
    label: "商业筹措",
    summary: "换取金库、补给与新一轮决策资本。"
  }
];

export const CARD_LIBRARY: DecisionCard[] = [
  {
    id: "iron-muster",
    title: "铁血征募",
    archetype: "military",
    description: "用威压与赏格迅速拉起一支能立刻北上的军队。",
    supportedAction: "expand",
    actionBonus: 4,
    legitimacyBonus: -1,
    supplyBonus: -2,
    treasuryBonus: -2
  },
  {
    id: "charter-congress",
    title: "议约公会",
    archetype: "diplomacy",
    description: "召集商绅、议员与地方豪强，把分裂的声音暂时拉回桌前。",
    supportedAction: "diplomacy",
    actionBonus: 3,
    legitimacyBonus: 5,
    supplyBonus: 0,
    treasuryBonus: -1
  },
  {
    id: "merchant-fleet",
    title: "商船护航",
    archetype: "trade",
    description: "以港口特许换商税与粮秣，让帝国先富起来。",
    supportedAction: "trade",
    actionBonus: 4,
    legitimacyBonus: 1,
    supplyBonus: 3,
    treasuryBonus: 7
  },
  {
    id: "frontier-charter",
    title: "边疆敕地",
    archetype: "frontier",
    description: "向边民与猎手许诺土地，把荒野变成帝国前哨。",
    supportedAction: "expand",
    actionBonus: 2,
    legitimacyBonus: 2,
    supplyBonus: 4,
    treasuryBonus: -1
  },
  {
    id: "royal-audit",
    title: "王室审计",
    archetype: "trade",
    description: "用铁腕审计压榨腐败与浪费，把碎银子重新拢回国库。",
    supportedAction: "govern",
    actionBonus: 2,
    legitimacyBonus: -2,
    supplyBonus: 0,
    treasuryBonus: 5
  },
  {
    id: "shadow-couriers",
    title: "暗线驿使",
    archetype: "diplomacy",
    description: "通过密使和流言打乱对手判断，也让你更接近暗面的权力。",
    supportedAction: "diplomacy",
    actionBonus: 2,
    legitimacyBonus: 1,
    supplyBonus: 0,
    treasuryBonus: 0
  }
];

export const EVENT_LIBRARY: EventCard[] = [
  {
    id: "stamp-turmoil",
    title: "印花税风波",
    description: "城里商人与印刷作坊联名上书，抱怨新税令正在挤压殖民地活力。",
    choices: [
      {
        id: "ease-burden",
        label: "暂缓征敛，先稳民心",
        description: "国库稍受损失，但局势会暂时缓和。",
        resourceDelta: { treasury: -5, legitimacy: 6 },
        tensionDelta: -4,
        traitGain: "仁政",
        logTitle: "民心回暖",
        logDescription: "你让步于民意，城市局势转稳，民心暂且向王座回流。"
      },
      {
        id: "tighten-levy",
        label: "提高征敛，补足国库",
        description: "钱箱更满，但怨气会在港口与议会间回响。",
        resourceDelta: { treasury: 8, legitimacy: -3 },
        tensionDelta: 6,
        traitGain: "铁腕",
        logTitle: "宫廷勒令",
        logDescription: "你命令税吏严征，宫廷局势看似稳住，街巷中的不满却更浓了。"
      }
    ]
  },
  {
    id: "frontier-rumors",
    title: "边疆传言",
    description: "山地传来流言，说某个边贸站正在暗中联络外国商队与部族首领。",
    choices: [
      {
        id: "send-scouts",
        label: "派出侦骑与使节",
        description: "花一些补给，换更稳的边疆消息面。",
        resourceDelta: { supply: -4, legitimacy: 2 },
        foreignPressureDelta: -3,
        unionProgressDelta: 3,
        traitGain: "谨慎",
        logTitle: "边疆巡探",
        logDescription: "你的侦骑稳住了边疆局势，也让帝国离山道深处更近一步。"
      },
      {
        id: "burn-outposts",
        label: "先发制人，焚毁据点",
        description: "武力恐吓会制造震慑，也会带来新的裂痕。",
        resourceDelta: { arms: -5, legitimacy: -2 },
        tensionDelta: 5,
        traitGain: "冷酷",
        logTitle: "边疆震慑",
        logDescription: "火焰一度压住了边疆骚动，但民心与局势都记住了这场清剿。"
      }
    ]
  },
  {
    id: "foreign-envoy",
    title: "列强密使",
    description: "法国与西班牙的使节都在试探你的底牌，想知道你是否愿意交换未来。",
    choices: [
      {
        id: "play-both-sides",
        label: "两面下注，先取筹码",
        description: "赢得时间与空间，但需要更精细的权谋。",
        resourceDelta: { legitimacy: 3, treasury: 3 },
        foreignPressureDelta: -5,
        traitGain: "务实",
        logTitle: "宫廷两面手",
        logDescription: "你让宫廷局势暂时向自己倾斜，也把列强的试探拖进了迷雾。"
      },
      {
        id: "reject-envoys",
        label: "严词拒绝，树立威望",
        description: "姿态更强硬，但对手也会更警惕。",
        resourceDelta: { legitimacy: 4 },
        foreignPressureDelta: 2,
        tensionDelta: 2,
        traitGain: "高傲",
        logTitle: "王座示威",
        logDescription: "你在宫廷中树起更强的威望，外部局势却因此更快紧绷。"
      }
    ]
  }
];

export const FACTION_BASELINE: FactionStatus[] = [
  {
    id: "britain",
    name: "大英王冠",
    influence: 82,
    attitude: -15,
    agenda: "维系海港税权与殖民秩序。"
  },
  {
    id: "france",
    name: "法兰西残网",
    influence: 46,
    attitude: 8,
    agenda: "借旧盟与走私渠道牵制英方。"
  },
  {
    id: "spain",
    name: "西属路易斯安那",
    influence: 43,
    attitude: -4,
    agenda: "守住密西西比流域并观望新王的胃口。"
  },
  {
    id: "assemblies",
    name: "殖民地议会",
    influence: 58,
    attitude: 10,
    agenda: "争取自治与税务议价空间。"
  },
  {
    id: "confederacies",
    name: "边疆部族联盟",
    influence: 51,
    attitude: -2,
    agenda: "维系土地、贸易和安全边界。"
  }
];

export const ARCHETYPE_NAMES: Record<Archetype, { title: string; ambition: string }> = {
  military: {
    title: "铁血统御",
    ambition: "用军镇与远征把北美锻造成一张只听你命令的地图。"
  },
  diplomacy: {
    title: "权谋裁缝",
    ambition: "把列强与议会的裂缝缝成只属于你的王座阶梯。"
  },
  trade: {
    title: "海权商君",
    ambition: "让港口、航路和税契成为统一北美的真正军队。"
  },
  frontier: {
    title: "边疆拓主",
    ambition: "把山地、河谷和荒野上的每一道火种连成帝国边界。"
  }
};

export const EMPEROR_NAMES = ["亚瑟", "伊莱亚斯", "卡西安", "诺顿", "罗兰", "西奥多"];
export const EMPEROR_EPITHETS = ["穿雾者", "裂印者", "海上君主", "新大陆之鹰", "议约终结者"];
export const TRAIT_POOL = ["务实", "多疑", "雄辩", "坚忍", "仁政", "冷酷", "远见", "铁腕", "虔敬"];

export const ACTION_ARCHETYPE_WEIGHTS: Record<ActionId, Archetype[]> = {
  expand: ["military", "frontier"],
  govern: ["trade"],
  diplomacy: ["diplomacy"],
  trade: ["trade", "diplomacy"]
};
