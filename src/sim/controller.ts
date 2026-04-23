import { applyEventChoice, createRunState, performAction } from "./engine";
import { createSequenceRng, type SequenceRng } from "./random";
import type { ActionId, RunState } from "./types";

type Listener = (state: RunState) => void;

function cloneState(state: RunState): RunState {
  return JSON.parse(JSON.stringify(state)) as RunState;
}

export class EmpireController {
  private state: RunState;

  private listeners = new Set<Listener>();

  constructor(random: SequenceRng = createSequenceRng([0.17, 0.43, 0.69, 0.23, 0.81, 0.37, 0.55])) {
    this.state = createRunState(random);
  }

  getState(): RunState {
    return cloneState(this.state);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  selectRegion(regionId: string): void {
    if (!this.state.map.regions.some((region) => region.id === regionId)) {
      return;
    }

    this.state = {
      ...this.state,
      selectedRegionId: regionId
    };
    this.emit();
  }

  performAction(actionId: ActionId, cardId?: string): void {
    this.state = performAction(this.state, {
      actionId,
      cardId,
      targetRegionId: actionId === "expand" ? this.state.selectedRegionId ?? undefined : undefined
    });
    this.emit();
  }

  resolveEvent(choiceId: string): void {
    this.state = applyEventChoice(this.state, choiceId);
    this.emit();
  }

  restart(random: SequenceRng = createSequenceRng([0.17, 0.43, 0.69, 0.23, 0.81, 0.37, 0.55])): void {
    this.state = createRunState(random);
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export function buildRenderText(state: RunState): string {
  return JSON.stringify({
    mode: state.phase,
    origin: "top-left",
    axes: "x:right y:down",
    turn: state.turn,
    selectedRegion: state.selectedRegionId,
    controlled: state.controlledRegionIds,
    resources: state.resources,
    emperor: {
      name: `${state.emperor.name}${state.emperor.epithet}`,
      archetype: state.emperor.archetype,
      traits: state.emperor.traits
    },
    currentEvent: state.currentEvent
      ? {
          id: state.currentEvent.id,
          title: state.currentEvent.title,
          choices: state.currentEvent.choices.map((choice) => ({
            id: choice.id,
            label: choice.label
          }))
        }
      : null
  });
}
