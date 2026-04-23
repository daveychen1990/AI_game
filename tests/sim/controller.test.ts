import { describe, expect, it } from "vitest";

import { EmpireController, buildRenderText } from "../../src/sim/controller";
import { createSequenceRng } from "../../src/sim/random";

describe("EmpireController", () => {
  it("starts and restarts with a selected Chinese emperor", () => {
    const controller = new EmpireController(createSequenceRng([0.02, 0.61, 0.14, 0.87]), {
      emperorId: "zhao-kuangyin"
    });

    expect(controller.getState().emperor.name).toBe("赵匡胤");
    expect(controller.getState().emperor.epithet).toBe("宋太祖");

    controller.restart(createSequenceRng([0.21, 0.44, 0.68]), {
      emperorId: "zhao-kuangyin",
      startRegionId: "appalachian-gate"
    });

    expect(controller.getState().emperor.id).toBe("zhao-kuangyin");
    expect(controller.getState().startRegionId).toBe("appalachian-gate");
  });

  it("tracks region selection and routes expansion through the selected region", () => {
    const controller = new EmpireController(createSequenceRng([0.02, 0.61, 0.14, 0.87, 0.33, 0.48, 0.72, 0.19, 0.44]));
    const origin = controller.getState().selectedRegionId;
    const target = controller
      .getState()
      .map.regions.find((region) => region.id === controller.getState().startRegionId)
      ?.neighborIds[0];

    expect(origin).toBe(controller.getState().startRegionId);
    expect(target).toBeTruthy();

    controller.selectRegion(target ?? "");
    controller.performAction("expand");

    expect(controller.getState().selectedRegionId).toBe(target);
    expect(controller.getState().controlledRegionIds).toContain(target);
    expect(controller.getState().phase).toBe("event");
  });

  it("renders a compact JSON snapshot for automation hooks", () => {
    const controller = new EmpireController(createSequenceRng([0.46, 0.32, 0.28, 0.75, 0.11, 0.58, 0.83]));
    const text = buildRenderText(controller.getState());
    const parsed = JSON.parse(text) as {
      mode: string;
      origin: string;
      controlled: string[];
      selectedRegion: string | null;
    };

    expect(parsed.mode).toBe("command");
    expect(parsed.origin).toBe("top-left");
    expect(parsed.controlled).toHaveLength(1);
    expect(parsed.selectedRegion).toBe(controller.getState().startRegionId);
  });
});
