export function calculateSteps(totalRise: number, desiredStepHeight: number) {
  const numberOfSteps = Math.ceil(totalRise / desiredStepHeight);
  const actualStepHeight = totalRise / numberOfSteps;
  return { numberOfSteps, actualStepHeight };
}
