import { describe, expect, it } from "vitest";

import { buildEmperorSelectionRenderText } from "../../src/ui/emperorSelectionPresenter";
import { buildEmperorSelectionModel, getDefaultProgression } from "../../src/sim/emperors";

describe("emperor selection presenter", () => {
  it("renders a compact automation snapshot for the emperor selection screen", () => {
    const model = buildEmperorSelectionModel(getDefaultProgression(), "zhao-kuangyin");
    const parsed = JSON.parse(buildEmperorSelectionRenderText(model)) as {
      mode: string;
      selectedEmperorId: string;
      unlockedCount: number;
      cards: Array<{
        id: string;
        unlocked: boolean;
        selected: boolean;
        tooltip: string;
      }>;
    };

    const zhao = parsed.cards.find((card) => card.id === "zhao-kuangyin");
    const locked = parsed.cards.find((card) => !card.unlocked);

    expect(parsed.mode).toBe("emperor-select");
    expect(parsed.selectedEmperorId).toBe("zhao-kuangyin");
    expect(parsed.unlockedCount).toBe(1);
    expect(zhao?.selected).toBe(true);
    expect(zhao?.tooltip).toContain("杯酒释兵权");
    expect(locked?.tooltip).toContain("特殊能力未知");
  });
});
