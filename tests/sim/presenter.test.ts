import { describe, expect, it } from "vitest";

import { EmpireController } from "../../src/sim/controller";
import { buildHudModel } from "../../src/sim/presenter";
import { createSequenceRng } from "../../src/sim/random";

describe("buildHudModel", () => {
  it("marks expand as enabled when the selected region is a valid adjacent conquest target", () => {
    const controller = new EmpireController(createSequenceRng([0.02, 0.61, 0.14, 0.87, 0.33, 0.48, 0.72]));
    const targetId = controller
      .getState()
      .map.regions.find((region) => region.id === controller.getState().startRegionId)
      ?.neighborIds[0];

    expect(targetId).toBeTruthy();

    controller.selectRegion(targetId ?? "");
    const hud = buildHudModel(controller.getState(), null);
    const expandAction = hud.actions.find((action) => action.id === "expand");

    expect(hud.selectedRegion?.id).toBe(targetId);
    expect(hud.selectedRegion?.isExpandable).toBe(true);
    expect(expandAction?.enabled).toBe(true);
  });

  it("surfaces event choice data and pauses command actions during an event", () => {
    const controller = new EmpireController(createSequenceRng([0.46, 0.32, 0.28, 0.75, 0.11, 0.58, 0.83, 0.21, 0.67]));
    controller.performAction("govern");

    const hud = buildHudModel(controller.getState(), null);

    expect(hud.mode).toBe("event");
    expect(hud.eventPanel).toBeTruthy();
    expect(hud.eventPanel?.choices.length).toBeGreaterThan(0);
    expect(hud.actions.every((action) => action.enabled === false)).toBe(true);
  });
});
