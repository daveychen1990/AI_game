import { describe, expect, it } from "vitest";

import { createRunState, performAction } from "../../src/sim/engine";
import { createSequenceRng } from "../../src/sim/random";

describe("Zhao Kuangyin ability", () => {
  it("turns a successful expansion into extra legitimacy and lower foreign pressure", () => {
    const run = createRunState(createSequenceRng([0.1, 0.2, 0.3, 0.4, 0.5]), {
      emperorId: "zhao-kuangyin",
      startRegionId: "boston-harbor"
    });

    const next = performAction(run, {
      actionId: "expand",
      targetRegionId: "hudson-valley"
    });

    expect(run.emperor.id).toBe("zhao-kuangyin");
    expect(next.controlledRegionIds).toContain("hudson-valley");
    expect(next.resources.legitimacy).toBe(run.resources.legitimacy + 7);
    expect(next.foreignPressure).toBe(run.foreignPressure + 2);
    expect(next.logs.at(-1)?.description).toContain("杯酒释兵权");
  });
});
