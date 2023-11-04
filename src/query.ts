import bcd from "@mdn/browser-compat-data" assert { type: "json" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function query(path: string, data: any = bcd) {
  const pathElements = path.split(".");
  let lookup = data;
  while (pathElements.length) {
    const next = pathElements.shift();
    if (typeof next === "undefined" || !(next in lookup)) {
      throw new ReferenceError(
        `${path} is not a valid tree identifier (failed at '${next}')`,
      );
    }
    lookup = lookup[next];
  }
  return lookup;
}
