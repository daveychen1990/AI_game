import type { ActionId, RunState } from "./types";

export interface RegionViewModel {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  narrative: string;
  isControlled: boolean;
  isSelected: boolean;
  isExpandable: boolean;
}

export interface ActionViewModel {
  id: ActionId;
  label: string;
  summary: string;
  enabled: boolean;
  reason: string;
}

export interface CardViewModel {
  id: string;
  title: string;
  archetype: string;
  description: string;
  supportedAction: ActionId;
  selected: boolean;
}

export interface EventPanelViewModel {
  title: string;
  description: string;
  choices: {
    id: string;
    label: string;
    description: string;
  }[];
}

export interface HudModel {
  mode: RunState["phase"];
  title: string;
  emperorLine: string;
  ambition: string;
  selectedRegion: RegionViewModel | null;
  regions: RegionViewModel[];
  actions: ActionViewModel[];
  cards: CardViewModel[];
  eventPanel: EventPanelViewModel | null;
}

function isExpandableTarget(state: RunState, regionId: string): boolean {
  if (state.controlledRegionIds.includes(regionId)) {
    return false;
  }

  return state.controlledRegionIds.some((controlledId) => {
    const controlled = state.map.regions.find((region) => region.id === controlledId);
    return controlled?.neighborIds.includes(regionId) ?? false;
  });
}

function getActionEnabled(state: RunState, actionId: ActionId): { enabled: boolean; reason: string } {
  if (state.phase !== "command") {
    return {
      enabled: false,
      reason: "先处理当前事件。"
    };
  }

  if (actionId === "expand") {
    const selectedId = state.selectedRegionId;
    if (!selectedId || !isExpandableTarget(state, selectedId)) {
      return {
        enabled: false,
        reason: "选择一个相邻的未控制据点。"
      };
    }

    if (state.resources.arms < 5 || state.resources.supply < 6) {
      return {
        enabled: false,
        reason: "军械或补给不足。"
      };
    }
  }

  return {
    enabled: true,
    reason: "可执行"
  };
}

export function buildHudModel(state: RunState, selectedCardId: string | null): HudModel {
  const regions = state.map.regions.map<RegionViewModel>((region) => ({
    id: region.id,
    name: region.name,
    kind: region.kind,
    x: region.x,
    y: region.y,
    narrative: region.narrative,
    isControlled: state.controlledRegionIds.includes(region.id),
    isSelected: state.selectedRegionId === region.id,
    isExpandable: isExpandableTarget(state, region.id)
  }));

  const selectedRegion = regions.find((region) => region.isSelected) ?? null;

  return {
    mode: state.phase,
    title: "1770：帝国北美",
    emperorLine: `${state.emperor.name}${state.emperor.epithet} · ${state.emperor.traits.join(" / ")}`,
    ambition: state.emperor.ambition,
    selectedRegion,
    regions,
    actions: state.availableActions.map((action) => {
      const enabled = getActionEnabled(state, action.id);
      return {
        id: action.id,
        label: action.label,
        summary: action.summary,
        enabled: enabled.enabled,
        reason: enabled.reason
      };
    }),
    cards: state.hand.map((card) => ({
      id: card.id,
      title: card.title,
      archetype: card.archetype,
      description: card.description,
      supportedAction: card.supportedAction,
      selected: selectedCardId === card.id
    })),
    eventPanel: state.currentEvent
      ? {
          title: state.currentEvent.title,
          description: state.currentEvent.description,
          choices: state.currentEvent.choices.map((choice) => ({
            id: choice.id,
            label: choice.label,
            description: choice.description
          }))
        }
      : null
  };
}
