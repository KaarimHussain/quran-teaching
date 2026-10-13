import type { CurriculumLevelData, CurriculumModuleData } from "./data";

export type SeedPlan = {
  levelsToCreate: CurriculumLevelData[];
  modulesToCreate: { levelNumber: number; moduleOrder: number; module: CurriculumModuleData }[];
};

/**
 * Works out what the seed still needs to insert. It is create-only: levels and
 * modules that already exist (matched by level number / module code) are left
 * untouched so re-running the seed never overwrites admin edits.
 */
export function planSeed(
  data: CurriculumLevelData[],
  existingLevelNumbers: Set<number>,
  existingModuleCodes: Set<string>
): SeedPlan {
  return {
    levelsToCreate: data.filter((l) => !existingLevelNumbers.has(l.number)),
    modulesToCreate: data.flatMap((level) =>
      level.modules
        .map((module, moduleOrder) => ({ levelNumber: level.number, moduleOrder, module }))
        .filter(({ module }) => !existingModuleCodes.has(module.code))
    ),
  };
}
