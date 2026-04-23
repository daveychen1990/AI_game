import Phaser from "phaser";

import { EmpireMapScene } from "./game/EmpireMapScene";
import { buildRenderText, EmpireController } from "./sim/controller";
import { buildHudModel } from "./sim/presenter";
import { createSequenceRng } from "./sim/random";
import type { ActionId, RunState } from "./sim/types";
import "./styles.css";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
    empireController?: EmpireController;
  }
}

const controller = new EmpireController(createSequenceRng(makeSeed()));
const mapScene = new EmpireMapScene(controller);
let selectedCardId: string | null = null;
let currentState = controller.getState();

const game = new Phaser.Game({
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

const dossier = mustGet("imperial-dossier");
const regionDossier = mustGet("region-dossier");
const factionLedger = mustGet("faction-ledger");
const commandPanel = mustGet("command-panel");
const eventPanel = mustGet("event-panel");
const campaignLog = mustGet("campaign-log");

controller.subscribe((state) => {
  currentState = state;
  if (selectedCardId && !state.hand.some((card) => card.id === selectedCardId)) {
    selectedCardId = null;
  }
  renderHud(state);
});

window.empireController = controller;
window.render_game_to_text = () => buildRenderText(controller.getState());
window.advanceTime = (ms: number) => {
  mapScene.tick(ms);
};

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r") {
    restartRun();
  }
});

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

function renderHud(state: RunState): void {
  const hud = buildHudModel(state, selectedCardId);
  const emperor = state.emperor;

  dossier.innerHTML = `
    <section class="paper-card">
      <p class="label">帝王档案</p>
      <h2>${hud.emperorLine}</h2>
      <p class="muted">${hud.ambition}</p>
      <div class="attribute-grid">
        <span>统御 <strong>${emperor.attributes.command}</strong></span>
        <span>政务 <strong>${emperor.attributes.stewardship}</strong></span>
        <span>权谋 <strong>${emperor.attributes.intrigue}</strong></span>
        <span>威望 <strong>${emperor.attributes.prestige}</strong></span>
        <span>意志 <strong>${emperor.attributes.resolve}</strong></span>
      </div>
      <button class="secondary-button" data-restart>重新投身北美</button>
    </section>
  `;

  const selected = hud.selectedRegion;
  regionDossier.innerHTML = `
    <section class="paper-card">
      <p class="label">据点情报</p>
      <h3>${selected ? selected.name : "未选择据点"}</h3>
      <p>${selected ? selected.narrative : "点击地图上的城市、港口、要塞或边疆节点来选择下一步目标。"}</p>
      <div class="status-line">
        <span>${selected?.isControlled ? "帝国控制" : selected?.isExpandable ? "可远征目标" : "未知势力"}</span>
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
          .map((faction) => `<li><strong>${faction.name}</strong><span>${faction.attitude > 0 ? "+" : ""}${faction.attitude}</span></li>`)
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
              <button class="decision-card ${card.selected ? "is-selected" : ""}" data-card-id="${card.id}">
                <span>${card.archetype}</span>
                <strong>${card.title}</strong>
                <small>${card.description}</small>
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
              <button class="action-button" data-action-id="${action.id}" ${action.enabled ? "" : "disabled"}>
                <strong>${action.label}</strong>
                <small>${action.enabled ? action.summary : action.reason}</small>
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
        <h2>${hud.eventPanel.title}</h2>
        <p>${hud.eventPanel.description}</p>
        <div class="choice-grid">
          ${hud.eventPanel.choices
            .map(
              (choice) => `
                <button class="choice-button" data-choice-id="${choice.id}">
                  <strong>${choice.label}</strong>
                  <small>${choice.description}</small>
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
      <strong>${state.outcomeSummary}</strong>
    </div>
    <ol>
      ${state.logs
        .slice(-4)
        .reverse()
        .map((entry) => `<li><span>回合 ${entry.turn}</span><strong>${entry.title}</strong><p>${entry.description}</p></li>`)
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
      renderHud(currentState);
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-action-id]").forEach((button) => {
    button.addEventListener("click", () => {
      controller.performAction(button.dataset.actionId as ActionId, selectedCardId ?? undefined);
      selectedCardId = null;
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-choice-id]").forEach((button) => {
    button.addEventListener("click", () => {
      controller.resolveEvent(button.dataset.choiceId ?? "");
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-restart]").forEach((button) => {
    button.addEventListener("click", restartRun);
  });
}

function restartRun(): void {
  selectedCardId = null;
  controller.restart(createSequenceRng(makeSeed()));
}

void game;
