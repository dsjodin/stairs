import type { StairType, Warning } from "./types.js";

interface ValidationParams {
  actualStepHeight: number;
  actualStepDepth: number;
  stairWidth: number;
  slopeDegrees: number;
  sumRule: number;
  type: StairType;
  landingDepth?: number;
  winderSteps?: number;
  showStairwell?: boolean;
  stairwellStart?: number;
}

export function buildWarnings(params: ValidationParams): Warning[] {
  const warnings: Warning[] = [];

  if (params.actualStepHeight > 175) {
    warnings.push({
      code: "BBR_RISER_HEIGHT",
      message: `Steghojd ${params.actualStepHeight.toFixed(1)} mm overstiger max 175 mm (BBR 8:232)`,
      severity: "warn",
    });
  }

  if (params.actualStepDepth < 250) {
    warnings.push({
      code: "BBR_TREAD_DEPTH",
      message: `Stegdjup ${params.actualStepDepth.toFixed(1)} mm understiger min 250 mm (BBR 8:232)`,
      severity: "warn",
    });
  }

  if (params.stairWidth < 900) {
    warnings.push({
      code: "BBR_STAIR_WIDTH",
      message: `Trappbredd ${params.stairWidth.toFixed(0)} mm understiger min 900 mm for bostader (BBR 8:232)`,
      severity: "warn",
    });
  }

  if (params.slopeDegrees > 38) {
    warnings.push({
      code: "BBR_SLOPE",
      message: `Lutning ${params.slopeDegrees.toFixed(1)} deg overstiger max 38 deg`,
      severity: "warn",
    });
  }

  if (params.type === "L" && params.winderSteps) {
    // Winder mode: check walking-line tread depth
    const walkingLineRadius = (2 / 3) * params.stairWidth;
    const walkingLineDepth = walkingLineRadius * (Math.PI / 2 / params.winderSteps);
    if (walkingLineDepth < 250) {
      warnings.push({
        code: "BBR_WINDER_TREAD",
        message: `Ganglinjens stegdjup ${walkingLineDepth.toFixed(0)} mm understiger 250 mm - oka antal vindelsteg`,
        severity: "warn",
      });
    }
  } else if (params.type === "L" || params.type === "U") {
    // Landing mode: check landing depth
    const minLanding = Math.max(900, params.stairWidth);
    if (!params.landingDepth || params.landingDepth < minLanding) {
      const actual = params.landingDepth ?? 0;
      warnings.push({
        code: "BBR_LANDING_DEPTH",
        message: `Vilplanets djup ${actual.toFixed(0)} mm understiger minimum ${minLanding.toFixed(0)} mm`,
        severity: "warn",
      });
    }
  }

  if (params.sumRule < 430 || params.sumRule > 470) {
    warnings.push({
      code: "CONV_SUM_RULE",
      message: `Summaregeln h+d = ${Math.round(params.sumRule)} mm (bor vara 430-470 mm)`,
      severity: "warn",
    });
  }

  if (params.showStairwell && params.stairwellStart !== undefined && params.stairwellStart <= 0) {
    warnings.push({
      code: "BBR_HEADROOM",
      message: `Fri hojd uppnas ej - trapphalet maste tacka hela trappan`,
      severity: "error",
    });
  }

  return warnings;
}
