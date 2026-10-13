import { asStringList } from "@/lib/curriculum/lines";

type SectionKey = "subjects" | "mandatoryLearning" | "practice" | "assessment";

/**
 * Renders a curriculum module's What You Learn / Mandatory Learning / Practice /
 * Assessment lists. Sections with no items are omitted.
 */
export function ModuleSections({
  module,
  labels,
  only,
}: {
  module: Record<SectionKey, unknown>;
  labels: Record<SectionKey, string>;
  only?: SectionKey[];
}) {
  const keys = only ?? (["subjects", "mandatoryLearning", "practice", "assessment"] as SectionKey[]);
  const sections = keys
    .map((key) => ({ key, items: asStringList(module[key]) }))
    .filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sections.map(({ key, items }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">{labels[key]}</h4>
          <ul className="flex list-disc flex-col gap-0.5 ps-5 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
