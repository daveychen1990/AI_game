import { describe, expect, it } from "vitest";

import { buildEmperorSelectionModel, getDefaultProgression, getEmperorById } from "../../src/sim/emperors";

describe("Chinese emperor roster", () => {
  it("unlocks Zhao Kuangyin as the first playable emperor", () => {
    const progression = getDefaultProgression();
    const zhao = getEmperorById("zhao-kuangyin");

    expect(zhao.name).toBe("赵匡胤");
    expect(zhao.dynasty).toBe("北宋");
    expect(zhao.epithet).toBe("宋太祖");
    expect(zhao.ability.name).toBe("杯酒释兵权");
    expect(progression.unlockedEmperorIds).toEqual(["zhao-kuangyin"]);
  });

  it("builds selection cards with tooltip copy for unlocked and locked emperors", () => {
    const model = buildEmperorSelectionModel(getDefaultProgression(), "zhao-kuangyin");
    const first = model.cards[0];
    const locked = model.cards.find((card) => !card.unlocked);

    expect(model.selectedEmperorId).toBe("zhao-kuangyin");
    expect(first.unlocked).toBe(true);
    expect(first.tooltip.title).toBe("赵匡胤 · 宋太祖");
    expect(first.tooltip.heading).toBe("特殊能力");
    expect(first.tooltip.body).toContain("完成一次扩张远征");
    expect(locked?.tooltip.title).toBe("？？？");
    expect(locked?.tooltip.heading).toBe("未解锁");
    expect(locked?.tooltip.body).toContain("完成任务");
  });
});
