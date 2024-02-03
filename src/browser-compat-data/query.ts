import bcd from "@mdn/browser-compat-data" assert { type: "json" };

import { isIndexable } from "./typeUtils";

export function query(path: string, data: unknown = bcd) {
  const pathElements = path.split(".");
  let lookup = data;
  while (pathElements.length) {
    const next = pathElements.shift()!;

    if (!isIndexable(lookup) || !(next in lookup)) {
      throw new Error(`${path} is unindexable at '${next}'`);
    }
    lookup = lookup[next];
  }
  return lookup;
}
