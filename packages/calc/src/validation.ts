import type { StairType, Warning } from "./types.js";

interface ValidationParams {
  actualStepHeight: number;
  actualStepDepth: number;
  stairWidth: number;
  slopeDegrees: number;
  type: StairType;
  landingDepth?: number;
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

  if (params.type === "L" || params.type === "U") {
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

  return warnings;
}
