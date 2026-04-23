import Phaser from "phaser";

import type { EmpireController } from "../sim/controller";
import type { RegionNode, RunState } from "../sim/types";

const REGION_COLORS: Record<RegionNode["kind"], number> = {
  harbor: 0x275169,
  city: 0x8f3f2e,
  frontier: 0x556b38,
  fort: 0x5a4a43,
  trade: 0x98733d
};

export class EmpireMapScene extends Phaser.Scene {
  private readonly controller: EmpireController;

  private graphics: Phaser.GameObjects.Graphics | null = null;

  private labels: Phaser.GameObjects.Text[] = [];

  private currentState: RunState | null = null;

  constructor(controller: EmpireController) {
    super("empire-map");
    this.controller = controller;
  }

  create(): void {
    this.graphics = this.add.graphics();
    this.cameras.main.setBackgroundColor("#d9c591");

    this.controller.subscribe((state) => {
      this.currentState = state;
      this.drawMap(state);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.currentState) {
        return;
      }

      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      this.selectRegionAt(worldPoint.x, worldPoint.y);
    });

    this.game.canvas.addEventListener("click", (event) => {
      const rect = this.game.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * this.scale.width;
      const y = ((event.clientY - rect.top) / rect.height) * this.scale.height;
      this.selectRegionAt(x, y);
    });

    this.input.keyboard?.on("keydown-F", () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void document.documentElement.requestFullscreen();
      }
    });
  }

  private selectRegionAt(x: number, y: number): void {
    if (!this.currentState) {
      return;
    }

    const region = this.findRegionAt(x, y, this.currentState);
    (window as unknown as { __lastMapClick?: { x: number; y: number; regionId: string | null } }).__lastMapClick = {
      x: Math.round(x),
      y: Math.round(y),
      regionId: region?.id ?? null
    };

    if (region) {
      this.controller.selectRegion(region.id);
    }
  }

  tick(_ms: number): void {
    if (this.currentState) {
      this.drawMap(this.currentState);
    }
  }

  private findRegionAt(x: number, y: number, state: RunState): RegionNode | null {
    return (
      state.map.regions.find((region) => {
        const dx = region.x - x;
        const dy = region.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= 28;
      }) ?? null
    );
  }

  private drawMap(state: RunState): void {
    if (!this.graphics) {
      return;
    }

    this.graphics.clear();
    this.labels.forEach((label) => label.destroy());
    this.labels = [];

    this.drawParchment();
    this.drawRoutes(state);
    this.drawRegions(state);
    this.drawLegend();
  }

  private drawParchment(): void {
    if (!this.graphics) {
      return;
    }

    this.graphics.fillStyle(0xdcc796, 1);
    this.graphics.fillRoundedRect(18, 18, 724, 500, 22);
    this.graphics.lineStyle(3, 0x5d3f25, 0.75);
    this.graphics.strokeRoundedRect(18, 18, 724, 500, 22);

    for (let index = 0; index < 15; index += 1) {
      const x = 55 + index * 45;
      this.graphics.lineStyle(1, 0x8b6a3a, index % 2 === 0 ? 0.12 : 0.08);
      this.graphics.beginPath();
      this.graphics.moveTo(x, 40);
      this.graphics.lineTo(x + 26, 498);
      this.graphics.strokePath();
    }

    this.graphics.lineStyle(2, 0x31556a, 0.28);
    this.graphics.beginPath();
    this.graphics.moveTo(130, 70);
    [
      [188, 132],
      [214, 201],
      [270, 286],
      [334, 350],
      [421, 421],
      [520, 472]
    ].forEach(([x, y]) => {
      this.graphics?.lineTo(x, y);
    });
    this.graphics.strokePath();

    this.addText(62, 55, "北美殖民地 · 1770", "map-title");
  }

  private drawRoutes(state: RunState): void {
    if (!this.graphics) {
      return;
    }

    const drawn = new Set<string>();
    state.map.regions.forEach((region) => {
      region.neighborIds.forEach((neighborId) => {
        const key = [region.id, neighborId].sort().join(":");
        if (drawn.has(key)) {
          return;
        }

        const neighbor = state.map.regions.find((entry) => entry.id === neighborId);
        if (!neighbor) {
          return;
        }

        drawn.add(key);
        const controlledRoute =
          state.controlledRegionIds.includes(region.id) || state.controlledRegionIds.includes(neighbor.id);
        this.graphics?.lineStyle(4, controlledRoute ? 0xa36c2f : 0x7c6a52, controlledRoute ? 0.7 : 0.36);
        this.graphics?.beginPath();
        this.graphics?.moveTo(region.x, region.y);
        this.graphics?.lineTo(neighbor.x, neighbor.y);
        this.graphics?.strokePath();
      });
    });
  }

  private drawRegions(state: RunState): void {
    if (!this.graphics) {
      return;
    }

    state.map.regions.forEach((region) => {
      const controlled = state.controlledRegionIds.includes(region.id);
      const selected = state.selectedRegionId === region.id;
      const fill = controlled ? 0xb88a43 : REGION_COLORS[region.kind];
      const stroke = selected ? 0xf3d782 : controlled ? 0x2e2118 : 0x4d3827;
      const radius = selected ? 18 : controlled ? 16 : 14;

      this.graphics?.lineStyle(selected ? 5 : 3, stroke, selected ? 0.95 : 0.75);
      this.graphics?.fillStyle(fill, controlled ? 0.95 : 0.76);
      this.graphics?.fillCircle(region.x, region.y, radius);
      this.graphics?.strokeCircle(region.x, region.y, radius);

      if (controlled) {
        this.graphics?.fillStyle(0x23170f, 0.92);
        this.graphics?.fillTriangle(region.x, region.y - 8, region.x - 6, region.y + 6, region.x + 7, region.y + 5);
      }

      this.addText(region.x + 20, region.y - 10, region.name, selected ? "selected-label" : "region-label");
    });
  }

  private drawLegend(): void {
    if (!this.graphics) {
      return;
    }

    this.graphics.fillStyle(0xead8a9, 0.82);
    this.graphics.fillRoundedRect(478, 56, 220, 96, 14);
    this.graphics.lineStyle(1, 0x6e4e31, 0.45);
    this.graphics.strokeRoundedRect(478, 56, 220, 96, 14);
    this.addText(498, 72, "铜版图例", "legend-title");
    this.addText(498, 99, "金色：帝国控制", "legend");
    this.addText(498, 124, "深色：待征服据点", "legend");
  }

  private addText(x: number, y: number, text: string, className: string): void {
    const styles: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
      "map-title": {
        color: "#3a2819",
        fontFamily: "Noto Serif SC, Songti SC, serif",
        fontSize: "22px",
        fontStyle: "700"
      },
      "region-label": {
        color: "#332316",
        fontFamily: "Noto Serif SC, Songti SC, serif",
        fontSize: "15px",
        backgroundColor: "rgba(229, 210, 164, 0.52)"
      },
      "selected-label": {
        color: "#24150b",
        fontFamily: "Noto Serif SC, Songti SC, serif",
        fontSize: "16px",
        fontStyle: "700",
        backgroundColor: "rgba(243, 215, 130, 0.68)"
      },
      "legend-title": {
        color: "#392414",
        fontFamily: "Noto Serif SC, Songti SC, serif",
        fontSize: "15px",
        fontStyle: "700"
      },
      legend: {
        color: "#4a3423",
        fontFamily: "Noto Serif SC, Songti SC, serif",
        fontSize: "13px"
      }
    };

    this.labels.push(this.add.text(x, y, text, styles[className]));
  }
}
