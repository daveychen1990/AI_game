import {
  ARCHETYPE_NAMES,
  AVAILABLE_ACTIONS,
  CARD_LIBRARY,
  EMPEROR_EPITHETS,
  EMPEROR_NAMES,
  EVENT_LIBRARY,
  FACTION_BASELINE,
  MAP_REGIONS,
  START_REGION_IDS,
  TRAIT_POOL
} from "./content";
import { nextRandom, pickOne } from "./random";
import type {
  ActionSelection,
  Archetype,
  DecisionCard,
  EmperorAttributes,
  EmperorProfile,
  FactionStatus,
  RegionNode,
  ResourceState,
  RunState
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRegion(run: RunState, regionId: string): RegionNode {
  const region = run.map.regions.find((entry) => entry.id === regionId);

  if (!region) {
    throw new Error(`Unknown region: ${regionId}`);
  }

  return region;
}

function cloneResources(resources: ResourceState): ResourceState {
  return { ...resources };
}

function makeBaseAttributes(archetype: Archetype): EmperorAttributes {
  const byArchetype: Record<Archetype, EmperorAttributes> = {
    military: {
      command: 8,
      stewardship: 5,
      intrigue: 4,
      prestige: 6,
      resolve: 7
    },
    diplomacy: {
      command: 4,
      stewardship: 5,
      intrigue: 8,
      prestige: 7,
      resolve: 6
    },
    trade: {
      command: 4,
      stewardship: 8,
      intrigue: 5,
      prestige: 6,
      resolve: 6
    },
    frontier: {
      command: 6,
      stewardship: 5,
      intrigue: 5,
      prestige: 5,
      resolve: 8
    }
  };

  return byArchetype[archetype];
}

function mutateAttributes(base: EmperorAttributes, seedValues: number[]): EmperorAttributes {
  const keys = Object.keys(base) as (keyof EmperorAttributes)[];
  const adjusted = { ...base };

  keys.forEach((key, index) => {
    const offset = seedValues[index] > 0.66 ? 1 : seedValues[index] < 0.22 ? -1 : 0;
    adjusted[key] = clamp(base[key] + offset, 2, 10);
  });

  return adjusted;
}

function createEmperor(random: RunState["random"]): [EmperorProfile, RunState["random"]] {
  let next = random;

  const archetypes: Archetype[] = ["military", "diplomacy", "trade", "frontier"];
  const [archetype, rngAfterArchetype] = pickOne(next, archetypes);
  next = rngAfterArchetype;

  const [name, rngAfterName] = pickOne(next, EMPEROR_NAMES);
  next = rngAfterName;
  const [epithet, rngAfterEpithet] = pickOne(next, EMPEROR_EPITHETS);
  next = rngAfterEpithet;

  const variationSeeds: number[] = [];
  for (let index = 0; index < 5; index += 1) {
    const [value, rngAfterValue] = nextRandom(next);
    variationSeeds.push(value);
    next = rngAfterValue;
  }

  const traits: string[] = [];
  while (traits.length < 2) {
    const [trait, rngAfterTrait] = pickOne(next, TRAIT_POOL);
    next = rngAfterTrait;
    if (!traits.includes(trait)) {
      traits.push(trait);
    }
  }

  const descriptor = ARCHETYPE_NAMES[archetype];

  return [
    {
      name,
      epithet,
      archetype,
      ambition: descriptor.ambition,
      traits,
      attributes: mutateAttributes(makeBaseAttributes(archetype), variationSeeds)
    },
    next
  ];
}

function drawCard(hand: DecisionCard[], discardPile: DecisionCard[], random: RunState["random"]): [DecisionCard, RunState["random"]] {
  const deck = CARD_LIBRARY.filter(
    (card) => !hand.some((handCard) => handCard.id === card.id) && !discardPile.some((discard) => discard.id === card.id)
  );
  const source = deck.length > 0 ? deck : CARD_LIBRARY;

  return pickOne(random, source);
}

function fillHand(hand: DecisionCard[], discardPile: DecisionCard[], random: RunState["random"]): [DecisionCard[], RunState["random"]] {
  let next = random;
  const filled = [...hand];

  while (filled.length < 3) {
    const [card, rngAfterDraw] = drawCard(filled, discardPile, next);
    next = rngAfterDraw;
    filled.push(card);
  }

  return [filled, next];
}

function adjustFactions(factions: FactionStatus[], delta: number): FactionStatus[] {
  return factions.map((faction) => ({
    ...faction,
    attitude: clamp(
      faction.attitude +
        (faction.id === "britain" ? -delta : faction.id === "assemblies" ? Math.round(delta / 2) : 0),
      -100,
      100
    )
  }));
}

function resolveActionState(run: RunState, selection: ActionSelection): {
  resources: ResourceState;
  controlledRegionIds: string[];
  unionProgress: number;
  foreignPressure: number;
  tension: number;
  factions: FactionStatus[];
  logTitle: string;
  logDescription: string;
} {
  const resources = cloneResources(run.resources);
  let controlledRegionIds = [...run.controlledRegionIds];
  let unionProgress = run.unionProgress;
  let foreignPressure = run.foreignPressure;
  let tension = run.tension;
  let factions = run.factions.map((entry) => ({ ...entry }));
  let logTitle = "";
  let logDescription = "";

  const actionCard = selection.cardId ? run.hand.find((card) => card.id === selection.cardId) ?? null : null;
  const actionBonus = actionCard && actionCard.supportedAction === selection.actionId ? actionCard.actionBonus : 0;

  if (actionCard) {
    resources.legitimacy += actionCard.legitimacyBonus;
    resources.supply += actionCard.supplyBonus;
    resources.treasury += actionCard.treasuryBonus;
  }

  const attributes = run.emperor.attributes;

  switch (selection.actionId) {
    case "expand": {
      const targetId = selection.targetRegionId ?? getRegion(run, run.startRegionId).neighborIds[0];
      const targetRegion = getRegion(run, targetId);
      const adjacentToEmpire = run.controlledRegionIds.some((regionId) => getRegion(run, regionId).neighborIds.includes(targetId));

      if (!adjacentToEmpire || run.controlledRegionIds.includes(targetId)) {
        throw new Error("Expansion target must be adjacent and not already controlled.");
      }

      const pressureBonus = Math.max(0, Math.floor(run.foreignPressure / 12));
      const expeditionPower = attributes.command + Math.floor(attributes.resolve / 2) + actionBonus + Math.floor(resources.arms / 12);
      const defense = targetRegion.defense + pressureBonus;

      resources.supply -= 6;
      resources.arms -= 5;

      if (expeditionPower >= defense) {
        controlledRegionIds = [...controlledRegionIds, targetId];
        unionProgress = clamp(unionProgress + 10 + targetRegion.value * 2, 0, 100);
        resources.legitimacy += 4;
        foreignPressure += 4;
        tension += 3;
        factions = adjustFactions(factions, 6);
        logTitle = `远征战报：夺取${targetRegion.name}`;
        logDescription = `你的军政机器越过阻力，疆域向 ${targetRegion.name} 推进，新的边界已经写进战报。`;
      } else {
        resources.legitimacy -= 4;
        foreignPressure += 5;
        tension += 5;
        factions = adjustFactions(factions, 8);
        logTitle = `远征受挫：${targetRegion.name}`;
        logDescription = `远征在 ${targetRegion.name} 前折损颇多，战报提醒你北美局势仍远未归顺。`;
      }
      break;
    }
    case "govern": {
      resources.treasury += 8 + attributes.stewardship + actionBonus;
      resources.supply += 4 + Math.floor(attributes.stewardship / 2);
      resources.legitimacy += 3 + Math.floor(attributes.prestige / 3);
      foreignPressure = clamp(foreignPressure - 2, 0, 100);
      tension = clamp(tension - 4, 0, 100);
      factions = adjustFactions(factions, -2);
      logTitle = "宫廷整饬";
      logDescription = "你借审计与整编稳住财政和民心，让宫廷与地方局势稍稍归于秩序。";
      break;
    }
    case "diplomacy": {
      resources.legitimacy += 4 + Math.floor(attributes.intrigue / 2) + actionBonus;
      resources.treasury += 2;
      foreignPressure = clamp(foreignPressure - 5 - Math.floor(attributes.prestige / 2), 0, 100);
      tension = clamp(tension - 2, 0, 100);
      unionProgress = clamp(unionProgress + 3, 0, 100);
      factions = factions.map((faction) => ({
        ...faction,
        attitude: clamp(faction.attitude + (faction.id === "assemblies" ? 5 : faction.id === "britain" ? -2 : 2), -100, 100)
      }));
      logTitle = "宫廷交涉";
      logDescription = "你在列强与议会之间穿针引线，让局势暂时偏向王座，也为未来埋下更多筹码。";
      break;
    }
    case "trade": {
      resources.treasury += 10 + attributes.stewardship + actionBonus;
      resources.supply += 5 + Math.floor(attributes.resolve / 3);
      resources.arms += 3;
      unionProgress = clamp(unionProgress + 2, 0, 100);
      foreignPressure = clamp(foreignPressure - 1, 0, 100);
      logTitle = "商路回暖";
      logDescription = "港口和商队重新转动起来，新的财富让帝国远景更像一笔可以兑现的账。";
      break;
    }
  }

  resources.treasury = clamp(resources.treasury, 0, 120);
  resources.arms = clamp(resources.arms, 0, 120);
  resources.supply = clamp(resources.supply, 0, 120);
  resources.legitimacy = clamp(resources.legitimacy, 0, 100);
  foreignPressure = clamp(foreignPressure, 0, 100);
  tension = clamp(tension, 0, 100);

  return {
    resources,
    controlledRegionIds,
    unionProgress,
    foreignPressure,
    tension,
    factions,
    logTitle,
    logDescription
  };
}

function checkEndState(run: RunState): RunState["phase"] {
  if (run.controlledRegionIds.length >= 5 || run.unionProgress >= 100) {
    return "victory";
  }

  if (run.resources.legitimacy <= 0 || run.tension >= 100) {
    return "defeat";
  }

  return run.phase;
}

function drawEvent(random: RunState["random"]): [RunState["currentEvent"], RunState["random"]] {
  return pickOne(random, EVENT_LIBRARY);
}

export function createRunState(random: RunState["random"]): RunState {
  let next = random;
  const [emperor, rngAfterEmperor] = createEmperor(next);
  next = rngAfterEmperor;
  const [startRegionId, rngAfterStart] = pickOne(next, START_REGION_IDS);
  next = rngAfterStart;

  const [initialHand, rngAfterHand] = fillHand([], [], next);
  next = rngAfterHand;

  return {
    turn: 1,
    phase: "command",
    startRegionId,
    map: {
      regions: MAP_REGIONS
    },
    emperor,
    resources: {
      treasury: 28,
      arms: 22,
      supply: 24,
      legitimacy: 52
    },
    factions: FACTION_BASELINE.map((entry) => ({ ...entry })),
    hand: initialHand,
    discardPile: [],
    controlledRegionIds: [startRegionId],
    availableActions: AVAILABLE_ACTIONS,
    currentEvent: null,
    foreignPressure: 34,
    tension: 22,
    unionProgress: 12,
    selectedRegionId: startRegionId,
    outcomeSummary: `${emperor.name}${emperor.epithet}自 ${getRegion(
      {
        map: { regions: MAP_REGIONS },
        startRegionId
      } as RunState,
      startRegionId
    ).name} 起兵，准备以 ${ARCHETYPE_NAMES[emperor.archetype].title} 的姿态改写北美。`,
    logs: [
      {
        turn: 1,
        title: "登基异乡",
        description: `${emperor.name}${emperor.epithet}在 ${getRegion(
          {
            map: { regions: MAP_REGIONS },
            startRegionId
          } as RunState,
          startRegionId
        ).name} 建立了第一个权力据点。`
      }
    ],
    random: next
  };
}

export function performAction(run: RunState, selection: ActionSelection): RunState {
  if (run.phase !== "command") {
    throw new Error("Actions can only be performed during the command phase.");
  }

  const actionResult = resolveActionState(run, selection);

  let hand = run.hand;
  let discardPile = run.discardPile;
  if (selection.cardId) {
    const playedCard = run.hand.find((card) => card.id === selection.cardId);
    if (playedCard) {
      hand = run.hand.filter((card) => card.id !== selection.cardId);
      discardPile = [...run.discardPile, playedCard];
    }
  }

  let nextRandom = run.random;
  const [refilledHand, rngAfterHand] = fillHand(hand, discardPile, nextRandom);
  nextRandom = rngAfterHand;
  const [currentEvent, rngAfterEvent] = drawEvent(nextRandom);
  nextRandom = rngAfterEvent;

  const nextState: RunState = {
    ...run,
    resources: actionResult.resources,
    controlledRegionIds: actionResult.controlledRegionIds,
    unionProgress: actionResult.unionProgress,
    foreignPressure: actionResult.foreignPressure,
    tension: actionResult.tension,
    factions: actionResult.factions,
    hand: refilledHand,
    discardPile,
    currentEvent,
    phase: "event",
    outcomeSummary: actionResult.logDescription,
    logs: [
      ...run.logs,
      {
        turn: run.turn,
        title: actionResult.logTitle,
        description: actionResult.logDescription
      }
    ],
    random: nextRandom
  };

  return {
    ...nextState,
    phase: checkEndState(nextState) === "victory" ? "victory" : checkEndState(nextState)
  };
}

export function applyEventChoice(run: RunState, choiceId: string): RunState {
  if (run.phase !== "event" && run.phase !== "victory" && run.phase !== "defeat") {
    throw new Error("There is no pending event to resolve.");
  }

  if (!run.currentEvent) {
    return run;
  }

  const choice = run.currentEvent.choices.find((entry) => entry.id === choiceId);
  if (!choice) {
    throw new Error(`Unknown event choice: ${choiceId}`);
  }

  const nextResources = cloneResources(run.resources);
  const resourceDelta = choice.resourceDelta ?? {};

  nextResources.treasury = clamp(nextResources.treasury + (resourceDelta.treasury ?? 0), 0, 120);
  nextResources.arms = clamp(nextResources.arms + (resourceDelta.arms ?? 0), 0, 120);
  nextResources.supply = clamp(nextResources.supply + (resourceDelta.supply ?? 0), 0, 120);
  nextResources.legitimacy = clamp(nextResources.legitimacy + (resourceDelta.legitimacy ?? 0), 0, 100);

  const nextTraits = choice.traitGain && !run.emperor.traits.includes(choice.traitGain)
    ? [...run.emperor.traits, choice.traitGain]
    : [...run.emperor.traits];

  const resolved: RunState = {
    ...run,
    turn: run.turn + 1,
    phase: "command",
    emperor: {
      ...run.emperor,
      traits: nextTraits
    },
    resources: nextResources,
    foreignPressure: clamp(run.foreignPressure + (choice.foreignPressureDelta ?? 0), 0, 100),
    tension: clamp(run.tension + (choice.tensionDelta ?? 0), 0, 100),
    unionProgress: clamp(run.unionProgress + (choice.unionProgressDelta ?? 0), 0, 100),
    currentEvent: null,
    outcomeSummary: choice.logDescription,
    logs: [
      ...run.logs,
      {
        turn: run.turn,
        title: choice.logTitle,
        description: choice.logDescription
      }
    ]
  };

  return {
    ...resolved,
    phase: checkEndState(resolved)
  };
}
