import { Identifier } from "@mdn/browser-compat-data";

export function isIndexable(o: unknown): o is Record<string, unknown> {
  if (typeof o === "object" && o !== null && Object.keys(o).length > 0) {
    return true;
  }
  return false;
}

export function isFeatureData(o: unknown): o is Identifier {
  return isIndexable(o) && Object.keys(o).length > 0 && "__compat" in o;
}
