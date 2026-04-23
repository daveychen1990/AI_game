import type { EmperorSelectionModel } from "../sim/emperors";

export function buildEmperorSelectionRenderText(model: EmperorSelectionModel): string {
  const cards = model.cards.map((card) => ({
    id: card.id,
    name: card.unlocked ? card.name : "？？？",
    epithet: card.unlocked ? card.epithet : "未解锁",
    unlocked: card.unlocked,
    selected: card.selected,
    tooltip: `${card.tooltip.heading}：${card.tooltip.body}`
  }));

  return JSON.stringify({
    mode: "emperor-select",
    selectedEmperorId: model.selectedEmperorId,
    unlockedCount: cards.filter((card) => card.unlocked).length,
    cards
  });
}
