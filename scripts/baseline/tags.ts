import { walk } from "../../src/browser-compat-data";

export function toIDs(...tags: string[]): string[] {
  const feats: string[] = [];

  for (const item of walk()) {
    if ("compat" in item) {
      for (const tag of tags) {
        if ((item.compat.tags ?? []).includes(tag)) {
          feats.push(item.path);
        }
      }
    }
  }

  return feats;
}
