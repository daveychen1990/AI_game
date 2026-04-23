import type { SequenceRng } from "./random";

export type ActionId = "expand" | "govern" | "diplomacy" | "trade";
export type Archetype = "military" | "diplomacy" | "trade" | "frontier";
export type Phase = "command" | "event" | "victory" | "defeat";
export type RegionKind = "harbor" | "city" | "frontier" | "fort" | "trade";

export interface EmperorAttributes {
  command: number;
  stewardship: number;
  intrigue: number;
  prestige: number;
  resolve: number;
}

export interface EmperorAbility {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface EmperorProfile {
  id: string;
  name: string;
  dynasty: string;
  epithet: string;
  archetype: Archetype;
  ambition: string;
  traits: string[];
  attributes: EmperorAttributes;
  ability: EmperorAbility;
}

export interface RegionNode {
  id: string;
  name: string;
  kind: RegionKind;
  tags: string[];
  value: number;
  defense: number;
  x: number;
  y: number;
  neighborIds: string[];
  narrative: string;
}

export interface DecisionCard {
  id: string;
  title: string;
  archetype: Archetype;
  description: string;
  supportedAction: ActionId;
  actionBonus: number;
  legitimacyBonus: number;
  supplyBonus: number;
  treasuryBonus: number;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  resourceDelta?: Partial<ResourceState>;
  foreignPressureDelta?: number;
  tensionDelta?: number;
  unionProgressDelta?: number;
  traitGain?: string;
  logTitle: string;
  logDescription: string;
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface ResourceState {
  treasury: number;
  arms: number;
  supply: number;
  legitimacy: number;
}

export interface FactionStatus {
  id: string;
  name: string;
  influence: number;
  attitude: number;
  agenda: string;
}

export interface LogEntry {
  turn: number;
  title: string;
  description: string;
}

export interface GameAction {
  id: ActionId;
  label: string;
  summary: string;
}

export interface MapState {
  regions: RegionNode[];
}

export interface RunState {
  turn: number;
  phase: Phase;
  startRegionId: string;
  map: MapState;
  emperor: EmperorProfile;
  resources: ResourceState;
  factions: FactionStatus[];
  hand: DecisionCard[];
  discardPile: DecisionCard[];
  controlledRegionIds: string[];
  availableActions: GameAction[];
  currentEvent: EventCard | null;
  foreignPressure: number;
  tension: number;
  unionProgress: number;
  selectedRegionId: string | null;
  outcomeSummary: string;
  logs: LogEntry[];
  random: SequenceRng;
}

export interface ActionSelection {
  actionId: ActionId;
  targetRegionId?: string;
  cardId?: string;
}

export interface CreateRunOptions {
  emperorId?: string;
  startRegionId?: string;
}
