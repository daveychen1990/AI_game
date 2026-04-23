import type { Archetype, EmperorAbility, EmperorAttributes, EmperorProfile } from "./types";

export interface EmperorDefinition {
  id: string;
  name: string;
  dynasty: string;
  epithet: string;
  archetype: Archetype;
  difficulty: "简单" | "普通" | "困难";
  ambition: string;
  traits: string[];
  attributes: EmperorAttributes;
  ability: EmperorAbility;
  unlockCondition: string;
}

export interface ProgressionState {
  unlockedEmperorIds: string[];
  completedTaskIds: string[];
}

export interface EmperorSelectionCard {
  id: string;
  name: string;
  dynasty: string;
  epithet: string;
  archetype: Archetype;
  difficulty: string;
  unlocked: boolean;
  selected: boolean;
  traits: string[];
  attributes: EmperorAttributes;
  tooltip: {
    title: string;
    heading: string;
    body: string;
  };
}

export interface EmperorSelectionModel {
  selectedEmperorId: string;
  cards: EmperorSelectionCard[];
}

export const CHINESE_EMPERORS: EmperorDefinition[] = [
  {
    id: "zhao-kuangyin",
    name: "赵匡胤",
    dynasty: "北宋",
    epithet: "宋太祖",
    archetype: "military",
    difficulty: "简单",
    ambition: "身无禁军，亦无汴梁，但他仍懂得：天下不只靠刀剑夺来，更靠夺来之后还能守住。",
    traits: ["开国", "宽仁", "军政整合", "杯酒释兵权"],
    attributes: {
      command: 8,
      stewardship: 7,
      intrigue: 6,
      prestige: 8,
      resolve: 7
    },
    ability: {
      id: "cup-wine-disarms-generals",
      name: "杯酒释兵权",
      type: "军政整合",
      description: "完成一次扩张远征后，若合法性不低于 40，额外获得 +3 合法性，并降低外部压力 2。"
    },
    unlockCondition: "初始解锁"
  },
  {
    id: "qin-shihuang",
    name: "嬴政",
    dynasty: "秦",
    epithet: "秦始皇",
    archetype: "military",
    difficulty: "困难",
    ambition: "用法、度量与道路把分裂的新大陆压成一块完整版图。",
    traits: ["一统", "法度", "高压"],
    attributes: { command: 9, stewardship: 7, intrigue: 6, prestige: 9, resolve: 9 },
    ability: {
      id: "commandery-law",
      name: "郡县同轨",
      type: "高压统一",
      description: "占领地区时获得更高统一进度，但殖民地紧张上升更快。"
    },
    unlockCondition: "完成任务：一局内通过远征控制 3 个地区。"
  },
  {
    id: "li-shimin",
    name: "李世民",
    dynasty: "唐",
    epithet: "唐太宗",
    archetype: "diplomacy",
    difficulty: "普通",
    ambition: "以军功立国，以人才和盟约让边疆主动归附。",
    traits: ["天策", "纳谏", "怀柔"],
    attributes: { command: 8, stewardship: 7, intrigue: 7, prestige: 9, resolve: 7 },
    ability: {
      id: "zhenguan-council",
      name: "贞观群臣",
      type: "人才外交",
      description: "外交成功后有机会额外抽取一张决策卡。"
    },
    unlockCondition: "完成任务：通过外交行动降低外部压力 3 次。"
  },
  {
    id: "liu-che",
    name: "刘彻",
    dynasty: "西汉",
    epithet: "汉武帝",
    archetype: "frontier",
    difficulty: "普通",
    ambition: "让边疆、贸易与远征共同为帝国的雄心输血。",
    traits: ["远征", "财税", "边疆"],
    attributes: { command: 8, stewardship: 6, intrigue: 6, prestige: 8, resolve: 8 },
    ability: {
      id: "hexi-corridor",
      name: "开河西",
      type: "边疆远征",
      description: "从边疆据点扩张时补给消耗降低。"
    },
    unlockCondition: "完成任务：从边疆出生点开局并控制密西西比贸易站。"
  },
  {
    id: "zhu-yuanzhang",
    name: "朱元璋",
    dynasty: "明",
    epithet: "明太祖",
    archetype: "trade",
    difficulty: "困难",
    ambition: "从贫瘠与乱局里重建秩序，让腐败和饥荒都向王法低头。",
    traits: ["草莽", "反腐", "铁腕"],
    attributes: { command: 7, stewardship: 9, intrigue: 7, prestige: 7, resolve: 9 },
    ability: {
      id: "hongwu-audit",
      name: "洪武重典",
      type: "反腐整饬",
      description: "治理行动获得更多金库收益，但可能降低合法性。"
    },
    unlockCondition: "完成任务：一局内金库达到 80。"
  },
  {
    id: "wu-zhao",
    name: "武曌",
    dynasty: "武周",
    epithet: "则天皇帝",
    archetype: "diplomacy",
    difficulty: "困难",
    ambition: "让旧贵族互相猜疑，让新秩序只承认她的名字。",
    traits: ["权谋", "破格", "女帝"],
    attributes: { command: 5, stewardship: 7, intrigue: 10, prestige: 8, resolve: 8 },
    ability: {
      id: "secret-court",
      name: "控鹤密廷",
      type: "宫廷权谋",
      description: "事件选择带来的负面合法性影响降低。"
    },
    unlockCondition: "完成任务：在合法性低于 20 时赢得一次重大事件。"
  },
  {
    id: "kangxi",
    name: "玄烨",
    dynasty: "清",
    epithet: "康熙帝",
    archetype: "frontier",
    difficulty: "普通",
    ambition: "以耐心、巡行与盟约把辽阔边疆纳入长期秩序。",
    traits: ["边疆", "怀柔", "长治"],
    attributes: { command: 7, stewardship: 8, intrigue: 7, prestige: 8, resolve: 8 },
    ability: {
      id: "imperial-tour",
      name: "圣祖巡边",
      type: "边疆整合",
      description: "控制边疆地区后降低殖民地紧张。"
    },
    unlockCondition: "完成任务：首次达成统一胜利。"
  },
  {
    id: "locked-slot-08",
    name: "未识帝王",
    dynasty: "？？",
    epithet: "未解锁",
    archetype: "military",
    difficulty: "普通",
    ambition: "一段尚未显影的帝王命运。",
    traits: ["未知"],
    attributes: { command: 6, stewardship: 6, intrigue: 6, prestige: 6, resolve: 6 },
    ability: { id: "unknown-08", name: "未知能力", type: "未知", description: "特殊能力未知。" },
    unlockCondition: "完成任务：后续版本解锁。"
  },
  {
    id: "locked-slot-09",
    name: "未识帝王",
    dynasty: "？？",
    epithet: "未解锁",
    archetype: "trade",
    difficulty: "普通",
    ambition: "一段尚未显影的帝王命运。",
    traits: ["未知"],
    attributes: { command: 6, stewardship: 6, intrigue: 6, prestige: 6, resolve: 6 },
    ability: { id: "unknown-09", name: "未知能力", type: "未知", description: "特殊能力未知。" },
    unlockCondition: "完成任务：后续版本解锁。"
  },
  {
    id: "locked-slot-10",
    name: "未识帝王",
    dynasty: "？？",
    epithet: "未解锁",
    archetype: "frontier",
    difficulty: "普通",
    ambition: "一段尚未显影的帝王命运。",
    traits: ["未知"],
    attributes: { command: 6, stewardship: 6, intrigue: 6, prestige: 6, resolve: 6 },
    ability: { id: "unknown-10", name: "未知能力", type: "未知", description: "特殊能力未知。" },
    unlockCondition: "完成任务：后续版本解锁。"
  },
  {
    id: "locked-slot-11",
    name: "未识帝王",
    dynasty: "？？",
    epithet: "未解锁",
    archetype: "diplomacy",
    difficulty: "普通",
    ambition: "一段尚未显影的帝王命运。",
    traits: ["未知"],
    attributes: { command: 6, stewardship: 6, intrigue: 6, prestige: 6, resolve: 6 },
    ability: { id: "unknown-11", name: "未知能力", type: "未知", description: "特殊能力未知。" },
    unlockCondition: "完成任务：后续版本解锁。"
  },
  {
    id: "locked-slot-12",
    name: "未识帝王",
    dynasty: "？？",
    epithet: "未解锁",
    archetype: "military",
    difficulty: "普通",
    ambition: "一段尚未显影的帝王命运。",
    traits: ["未知"],
    attributes: { command: 6, stewardship: 6, intrigue: 6, prestige: 6, resolve: 6 },
    ability: { id: "unknown-12", name: "未知能力", type: "未知", description: "特殊能力未知。" },
    unlockCondition: "完成任务：后续版本解锁。"
  }
];

export function getDefaultProgression(): ProgressionState {
  return {
    unlockedEmperorIds: ["zhao-kuangyin"],
    completedTaskIds: []
  };
}

export function getEmperorById(id: string): EmperorDefinition {
  const emperor = CHINESE_EMPERORS.find((entry) => entry.id === id);
  if (!emperor) {
    throw new Error(`Unknown emperor: ${id}`);
  }

  return emperor;
}

export function getEmperorProfileById(id: string): EmperorProfile {
  const emperor = getEmperorById(id);

  return {
    id: emperor.id,
    name: emperor.name,
    dynasty: emperor.dynasty,
    epithet: emperor.epithet,
    archetype: emperor.archetype,
    ambition: emperor.ambition,
    traits: [...emperor.traits],
    attributes: { ...emperor.attributes },
    ability: { ...emperor.ability }
  };
}

export function buildEmperorSelectionModel(progression: ProgressionState, selectedEmperorId?: string): EmperorSelectionModel {
  const fallbackId = progression.unlockedEmperorIds[0] ?? "zhao-kuangyin";
  const selected = selectedEmperorId && progression.unlockedEmperorIds.includes(selectedEmperorId) ? selectedEmperorId : fallbackId;

  return {
    selectedEmperorId: selected,
    cards: CHINESE_EMPERORS.map((emperor) => {
      const unlocked = progression.unlockedEmperorIds.includes(emperor.id);
      return {
        id: emperor.id,
        name: emperor.name,
        dynasty: emperor.dynasty,
        epithet: emperor.epithet,
        archetype: emperor.archetype,
        difficulty: emperor.difficulty,
        unlocked,
        selected: emperor.id === selected,
        traits: [...emperor.traits],
        attributes: { ...emperor.attributes },
        tooltip: unlocked
          ? {
              title: `${emperor.name} · ${emperor.epithet}`,
              heading: "特殊能力",
              body: `${emperor.ability.name}：${emperor.ability.description}`
            }
          : {
              title: "？？？",
              heading: "未解锁",
              body: `${emperor.unlockCondition} 特殊能力未知。`
            }
      };
    })
  };
}
