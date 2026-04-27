import { describe, expect, it } from "vitest";

import { createRunState, applyEventChoice, performAction } from "../../src/sim/engine";
import { createSequenceRng } from "../../src/sim/random";

describe("createRunState", () => {
  it("creates a run with a random start, emperor profile, and initial hand", () => {
    const rng = createSequenceRng([0.02, 0.61, 0.14, 0.87, 0.33, 0.48, 0.72]);

    const run = createRunState(rng);

    expect(run.turn).toBe(1);
    expect(run.phase).toBe("command");
    expect(run.controlledRegionIds).toHaveLength(1);
    expect(run.emperor.archetype).toBe("military");
    expect(run.emperor.traits.length).toBeGreaterThanOrEqual(2);
    expect(run.hand).toHaveLength(3);
    expect(run.availableActions.map((action) => action.id)).toEqual([
      "expand",
      "govern",
      "diplomacy",
      "trade"
    ]);
  });
});

describe("performAction", () => {
  it("captures an adjacent neutral region during expansion and advances to an event", () => {
    const rng = createSequenceRng([0.02, 0.61, 0.14, 0.87, 0.33, 0.48, 0.72, 0.19, 0.44]);
    const run = createRunState(rng);
    const startRegion = run.map.regions.find((region) => region.id === run.startRegionId);
    const targetId = startRegion?.neighborIds[0];

    expect(targetId).toBeDefined();

    const next = performAction(run, {
      actionId: "expand",
      targetRegionId: targetId
    });

    expect(next.controlledRegionIds).toContain(targetId);
    expect(next.phase).toBe("event");
    expect(next.currentEvent?.id).toBeTruthy();
    expect(next.unionProgress).toBeGreaterThan(run.unionProgress);
    expect(next.logs.at(-1)?.title).toMatch(/战报|远征|疆域/);
  });

  it("applies a card modifier before resolving a diplomacy action", () => {
    const rng = createSequenceRng([0.46, 0.32, 0.28, 0.75, 0.11, 0.58, 0.83, 0.21, 0.67]);
    const run = createRunState(rng);
    const card = run.hand.find((entry) => entry.archetype === "diplomacy");

    expect(card).toBeDefined();

    const next = performAction(run, {
      actionId: "diplomacy",
      cardId: card?.id
    });

    expect(next.resources.legitimacy).toBeGreaterThan(run.resources.legitimacy);
    expect(next.foreignPressure).toBeLessThanOrEqual(run.foreignPressure);
    expect(next.discardPile).toContainEqual(expect.objectContaining({ id: card?.id }));
  });
});

describe("applyEventChoice", () => {
  it("resolves an event choice, mutates emperor traits, and returns to command phase", () => {
    const rng = createSequenceRng([0.11, 0.66, 0.22, 0.79, 0.31, 0.52, 0.84, 0.08, 0.57, 0.13]);
    const run = performAction(createRunState(rng), { actionId: "govern" });

    expect(run.currentEvent).toBeTruthy();

    const choiceId = run.currentEvent?.choices[0].id;
    const resolved = applyEventChoice(run, choiceId ?? "");

    expect(resolved.phase).toBe("command");
    expect(resolved.turn).toBe(2);
    expect(resolved.currentEvent).toBeNull();
    expect(resolved.emperor.traits.length).toBeGreaterThanOrEqual(run.emperor.traits.length);
    expect(resolved.logs.at(-1)?.description).toMatch(/局势|民心|边疆|宫廷/);
  });
});
