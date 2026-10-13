export type ModuleState = "completed" | "unlocked" | "locked";

export type AccessModule = {
  id: string;
  /** null for legacy, admin-created modules that are not part of the curriculum */
  levelNumber: number | null;
  moduleOrder: number;
  isGated: boolean;
};

/**
 * Decides which modules of one course a student can open. Curriculum modules
 * are walked in (level, moduleOrder) order; once a gated module is reached
 * that has not been signed off, everything after it is locked. A signed-off
 * module always reads as completed, even if an earlier sign-off was revoked.
 */
export function computeModuleAccess(
  modules: AccessModule[],
  signedOffIds: ReadonlySet<string>
): Map<string, ModuleState> {
  const states = new Map<string, ModuleState>();

  const curriculum = modules
    .filter((m) => m.levelNumber !== null)
    .sort((a, b) => a.levelNumber! - b.levelNumber! || a.moduleOrder - b.moduleOrder);

  let blocked = false;
  for (const m of curriculum) {
    const signed = signedOffIds.has(m.id);
    states.set(m.id, signed ? "completed" : blocked ? "locked" : "unlocked");
    if (m.isGated && !signed) blocked = true;
  }

  for (const m of modules) {
    if (m.levelNumber === null) {
      states.set(m.id, signedOffIds.has(m.id) ? "completed" : "unlocked");
    }
  }

  return states;
}
