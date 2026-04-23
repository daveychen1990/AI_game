import Phaser from "phaser";

import { EmpireMapScene } from "./game/EmpireMapScene";
import { buildRenderText, EmpireController } from "./sim/controller";
import { buildEmperorSelectionModel, CHINESE_EMPERORS, getDefaultProgression } from "./sim/emperors";
import { buildHudModel } from "./sim/presenter";
import { createSequenceRng } from "./sim/random";
import type { EmperorSelectionCard, ProgressionState } from "./sim/emperors";
import type { ActionId, Archetype, RunState } from "./sim/types";
import { buildEmperorSelectionRenderText } from "./ui/emperorSelectionPresenter";
import "./styles.css";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    empireController?: EmpireController;
  }
}

const PROGRESSION_KEY = "empire-north-america-1770.progression";

const archetypeLabels: Record<Archetype, string> = {
  military: "铁血征服",
  diplomacy: "外交联邦",
  trade: "商业海权",
  frontier: "边疆殖拓"
};

const selectionRoot = mustGet("emperor-select-screen");
const warRoom = mustGet("war-room");
const gameRoot = mustGet("game-root");
const dossier = mustGet("imperial-dossier");
const regionDossier = mustGet("region-dossier");
const factionLedger = mustGet("faction-ledger");
const commandPanel = mustGet("command-panel");
const eventPanel = mustGet("event-panel");
const campaignLog = mustGet("campaign-log");

let progression = loadProgression();
let selectedEmperorId = progression.unlockedEmperorIds[0] ?? "zhao-kuangyin";
let controller: EmpireController | null = null;
let mapScene: EmpireMapScene | null = null;
let game: Phaser.Game | null = null;
let selectedCardId: string | null = null;
let currentState: RunState | null = null;

window.render_game_to_text = () => {
  if (!controller) {
    return buildEmperorSelectionRenderText(getSelectionModel());
  }

  return buildRenderText(controller.getState());
};

window.advanceTime = (ms: number) => {
  mapScene?.tick(ms);
};

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && controller) {
    restartRun();
  }
});

renderSelection();

function makeSeed(): number[] {
  return Array.from({ length: 24 }, () => Math.random());
}

function mustGet(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }

  return element;
}

function loadProgression(): ProgressionState {
  const defaults = getDefaultProgression();

  try {
    const raw = localStorage.getItem(PROGRESSION_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    const knownIds = new Set(CHINESE_EMPERORS.map((emperor) => emperor.id));
    const savedUnlocked = Array.isArray(parsed.unlockedEmperorIds)
      ? parsed.unlockedEmperorIds.filter((id): id is string => typeof id === "string" && knownIds.has(id))
      : [];
    const savedTasks = Array.isArray(parsed.completedTaskIds)
      ? parsed.completedTaskIds.filter((id): id is string => typeof id === "string")
      : [];

    return {
      unlockedEmperorIds: [...new Set([...defaults.unlockedEmperorIds, ...savedUnlocked])],
      completedTaskIds: [...new Set([...defaults.completedTaskIds, ...savedTasks])]
    };
  } catch {
    return defaults;
  }
}

function saveProgression(): void {
  localStorage.setItem(PROGRESSION_KEY, JSON.stringify(progression));
}

function getSelectionModel() {
  const model = buildEmperorSelectionModel(progression, selectedEmperorId);
  selectedEmperorId = model.selectedEmperorId;
  return model;
}

function renderSelection(): void {
  const model = getSelectionModel();
  const selected = model.cards.find((card) => card.selected) ?? model.cards[0];
  const unlockedCount = model.cards.filter((card) => card.unlocked).length;

  selectionRoot.innerHTML = `
    <div class="emperor-select__shell">
      <section class="emperor-select__intro">
        <p class="label">帝王名册</p>
        <h2>选择穿越到 1770 北美的中国帝王</h2>
        <p>完成战役任务会逐步解锁更多帝王。首位可用帝王为赵匡胤，他适合用军事扩张后的秩序整合来稳住新领地。</p>
        <div class="unlock-progress">
          <span>已解锁 ${unlockedCount}/${model.cards.length}</span>
          <span>默认帝王：赵匡胤 · 宋太祖</span>
        </div>
      </section>

      <section class="emperor-roster" aria-label="可选帝王名册">
        <div class="emperor-roster__topline">
          <p>悬停帝王头像可查看特殊能力；锁定头像只显示解锁任务。</p>
        </div>
        <div class="emperor-grid">
          ${model.cards.map(renderEmperorCard).join("")}
        </div>
      </section>

      <aside class="emperor-detail">
        ${renderSelectedEmperorDetail(selected)}
        <button class="primary-button" type="button" data-start-campaign>以此帝王进入北美</button>
      </aside>
    </div>
  `;

  bindSelectionEvents();
}

function renderEmperorCard(card: EmperorSelectionCard): string {
  const visibleName = card.unlocked ? card.name : "？？？";
  const visibleTitle = card.unlocked ? `${card.dynasty} · ${card.epithet}` : "未解锁帝王";
  const traitLine = card.unlocked ? card.traits.slice(0, 2).join(" / ") : "任务解锁";
  const portraitClass = card.unlocked ? `emperor-portrait--${card.id}` : "emperor-portrait--locked";

  return `
    <button
      class="emperor-card ${card.selected ? "is-selected" : ""} ${card.unlocked ? "is-unlocked" : "is-locked"}"
      type="button"
      data-emperor-card="${escapeAttribute(card.id)}"
      aria-pressed="${card.selected}"
      aria-disabled="${!card.unlocked}"
    >
      <span class="emperor-portrait ${portraitClass}" aria-hidden="true">
        <span class="portrait-bust"></span>
        ${card.unlocked ? "" : '<span class="emperor-lock">锁</span>'}
      </span>
      <span class="emperor-card__name">${escapeHtml(visibleName)}</span>
      <span class="emperor-card__meta">${escapeHtml(visibleTitle)}</span>
      <span class="emperor-card__trait">${escapeHtml(traitLine)}</span>
      <span class="emperor-tooltip" data-emperor-tooltip>
        <strong>${escapeHtml(card.tooltip.title)}</strong>
        <em>${escapeHtml(card.tooltip.heading)}</em>
        <span>${escapeHtml(card.tooltip.body)}</span>
      </span>
    </button>
  `;
}

function renderSelectedEmperorDetail(card: EmperorSelectionCard): string {
  if (!card.unlocked) {
    return `
      <p class="label">未解锁</p>
      <h2>影中帝王</h2>
      <p>${escapeHtml(card.tooltip.body)}</p>
    `;
  }

  return `
    <p class="label">当前帝王</p>
    <h2>${escapeHtml(card.name)} · ${escapeHtml(card.epithet)}</h2>
    <p class="emperor-detail__meta">${escapeHtml(card.dynasty)} / ${escapeHtml(archetypeLabels[card.archetype])} / ${escapeHtml(card.difficulty)}</p>
    <div class="trait-list">
      ${card.traits.map((trait) => `<span>${escapeHtml(trait)}</span>`).join("")}
    </div>
    <div class="attribute-grid emperor-detail__attributes">
      ${renderAttribute("统御", card.attributes.command)}
      ${renderAttribute("政务", card.attributes.stewardship)}
      ${renderAttribute("权谋", card.attributes.intrigue)}
      ${renderAttribute("威望", card.attributes.prestige)}
      ${renderAttribute("意志", card.attributes.resolve)}
    </div>
    <div class="ability-card">
      <p class="label">${escapeHtml(card.tooltip.heading)}</p>
      <p>${escapeHtml(card.tooltip.body)}</p>
    </div>
  `;
}

function renderAttribute(label: string, value: number): string {
  return `<span>${escapeHtml(label)} <strong>${value}</strong></span>`;
}

function bindSelectionEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-emperor-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextId = button.dataset.emperorCard;
      const card = getSelectionModel().cards.find((entry) => entry.id === nextId);
      if (!nextId || !card?.unlocked) {
        return;
      }

      selectedEmperorId = nextId;
      renderSelection();
    });
  });

  document.querySelector<HTMLButtonElement>("[data-start-campaign]")?.addEventListener("click", startCampaign);
}

function startCampaign(): void {
  const selected = getSelectionModel().cards.find((card) => card.id === selectedEmperorId);
  if (!selected?.unlocked) {
    return;
  }

  destroyGame();
  selectedCardId = null;
  controller = new EmpireController(createSequenceRng(makeSeed()), {
    emperorId: selectedEmperorId
  });
  currentState = controller.getState();
  window.empireController = controller;

  selectionRoot.classList.add("is-hidden");
  warRoom.classList.remove("is-hidden");

  controller.subscribe((state) => {
    currentState = state;
    if (selectedCardId && !state.hand.some((card) => card.id === selectedCardId)) {
      selectedCardId = null;
    }
    renderHud(state);
  });

  mapScene = new EmpireMapScene(controller);
  game = new Phaser.Game({
    type: Phaser.CANVAS,
    width: 760,
    height: 540,
    parent: "game-root",
    backgroundColor: "#d9c591",
    scene: [mapScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  });
}

function destroyGame(): void {
  if (game) {
    game.destroy(true);
  }

  game = null;
  mapScene = null;
  gameRoot.innerHTML = "";
}

function renderHud(state: RunState): void {
  const hud = buildHudModel(state, selectedCardId);
  const emperor = state.emperor;
  const selected = hud.selectedRegion;
  const selectedStatus = selected
    ? selected.isControlled
      ? "帝国控制"
      : selected.isExpandable
        ? "可远征目标"
        : "未知势力"
    : "暂无情报";

  dossier.innerHTML = `
    <section class="paper-card">
      <p class="label">帝王档案</p>
      <h2>${escapeHtml(hud.emperorLine)}</h2>
      <p class="muted">${escapeHtml(hud.ambition)}</p>
      <div class="ability-line">
        <strong>${escapeHtml(emperor.ability.name)}</strong>
        <span>${escapeHtml(emperor.ability.description)}</span>
      </div>
      <div class="attribute-grid">
        <span>统御 <strong>${emperor.attributes.command}</strong></span>
        <span>政务 <strong>${emperor.attributes.stewardship}</strong></span>
        <span>权谋 <strong>${emperor.attributes.intrigue}</strong></span>
        <span>威望 <strong>${emperor.attributes.prestige}</strong></span>
        <span>意志 <strong>${emperor.attributes.resolve}</strong></span>
      </div>
      <button class="secondary-button" type="button" data-restart>重新投身北美</button>
      <button class="secondary-button secondary-button--quiet" type="button" data-return-select>重选帝王</button>
    </section>
  `;

  regionDossier.innerHTML = `
    <section class="paper-card">
      <p class="label">据点情报</p>
      <h3>${escapeHtml(selected ? selected.name : "未选择据点")}</h3>
      <p>${escapeHtml(selected ? selected.narrative : "点击地图上的城市、港口、要塞或边疆节点来选择下一步目标。")}</p>
      <div class="status-line">
        <span>${escapeHtml(selectedStatus)}</span>
        <span>统一进度 ${state.unionProgress}%</span>
      </div>
    </section>
  `;

  factionLedger.innerHTML = `
    <section class="paper-card">
      <p class="label">列强账册</p>
      <div class="meter-row"><span>外部压力</span><strong>${state.foreignPressure}</strong></div>
      <div class="meter"><i style="width:${state.foreignPressure}%"></i></div>
      <div class="meter-row"><span>殖民地紧张</span><strong>${state.tension}</strong></div>
      <div class="meter meter--red"><i style="width:${state.tension}%"></i></div>
      <ul class="faction-list">
        ${state.factions
          .map(
            (faction) =>
              `<li><strong>${escapeHtml(faction.name)}</strong><span>${faction.attitude > 0 ? "+" : ""}${faction.attitude}</span></li>`
          )
          .join("")}
      </ul>
    </section>
  `;

  commandPanel.innerHTML = `
    <section class="paper-card">
      <p class="label">第 ${state.turn} 回合 · ${state.phase === "command" ? "御前议政" : "事件裁决"}</p>
      <h3>资源与政令</h3>
      <div class="resource-grid">
        <span>金库 <strong>${state.resources.treasury}</strong></span>
        <span>军械 <strong>${state.resources.arms}</strong></span>
        <span>补给 <strong>${state.resources.supply}</strong></span>
        <span>合法性 <strong>${state.resources.legitimacy}</strong></span>
      </div>
      <h3>决策卡</h3>
      <div class="card-row">
        ${hud.cards
          .map(
            (card) => `
              <button class="decision-card ${card.selected ? "is-selected" : ""}" type="button" data-card-id="${escapeAttribute(card.id)}">
                <span>${escapeHtml(card.archetype)}</span>
                <strong>${escapeHtml(card.title)}</strong>
                <small>${escapeHtml(card.description)}</small>
              </button>
            `
          )
          .join("")}
      </div>
      <h3>本回合行动</h3>
      <div class="action-grid">
        ${hud.actions
          .map(
            (action) => `
              <button class="action-button" type="button" data-action-id="${escapeAttribute(action.id)}" ${action.enabled ? "" : "disabled"}>
                <strong>${escapeHtml(action.label)}</strong>
                <small>${escapeHtml(action.enabled ? action.summary : action.reason)}</small>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;

  eventPanel.innerHTML = hud.eventPanel
    ? `
      <section class="paper-card event-card">
        <p class="label">铜版新闻</p>
        <h2>${escapeHtml(hud.eventPanel.title)}</h2>
        <p>${escapeHtml(hud.eventPanel.description)}</p>
        <div class="choice-grid">
          ${hud.eventPanel.choices
            .map(
              (choice) => `
                <button class="choice-button" type="button" data-choice-id="${escapeAttribute(choice.id)}">
                  <strong>${escapeHtml(choice.label)}</strong>
                  <small>${escapeHtml(choice.description)}</small>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `
    : `
      <section class="paper-card">
        <p class="label">王命提示</p>
        <p>选择地图上的相邻未控制据点，再执行“扩张远征”；或用治理、外交、贸易为下一轮积累优势。</p>
      </section>
    `;

  campaignLog.innerHTML = `
    <div>
      <p class="label">战报与宫廷纪事</p>
      <strong>${escapeHtml(state.outcomeSummary)}</strong>
    </div>
    <ol>
      ${state.logs
        .slice(-4)
        .reverse()
        .map(
          (entry) =>
            `<li><span>回合 ${entry.turn}</span><strong>${escapeHtml(entry.title)}</strong><p>${escapeHtml(entry.description)}</p></li>`
        )
        .join("")}
    </ol>
  `;

  bindHudEvents();
}

function bindHudEvents(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-card-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const cardId = button.dataset.cardId ?? null;
      selectedCardId = selectedCardId === cardId ? null : cardId;
      if (currentState) {
        renderHud(currentState);
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-action-id]").forEach((button) => {
    button.addEventListener("click", () => {
      controller?.performAction(button.dataset.actionId as ActionId, selectedCardId ?? undefined);
      selectedCardId = null;
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-choice-id]").forEach((button) => {
    button.addEventListener("click", () => {
      controller?.resolveEvent(button.dataset.choiceId ?? "");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-restart]").forEach((button) => {
    button.addEventListener("click", restartRun);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-return-select]").forEach((button) => {
    button.addEventListener("click", returnToSelection);
  });
}

function restartRun(): void {
  selectedCardId = null;
  controller?.restart(createSequenceRng(makeSeed()), {
    emperorId: selectedEmperorId
  });
}

function returnToSelection(): void {
  destroyGame();
  controller = null;
  currentState = null;
  selectedCardId = null;
  window.empireController = undefined;
  warRoom.classList.add("is-hidden");
  selectionRoot.classList.remove("is-hidden");
  renderSelection();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

void saveProgression;
