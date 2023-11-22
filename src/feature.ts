import { BrowserName, Identifier } from "@mdn/browser-compat-data";

import { browser } from "./browser";
import { query } from "./query";
import { isFeatureData } from "./typeUtils";
import { Release } from "./release";
import { RealSupportStatement, statement } from "./supportStatements";

export function feature(id: string, data?: Identifier): Feature {
  return new Feature(id, data);
}

export class Feature {
  id: string; // dotted.path.to.feature
  data: Identifier; // underlying BCD object

  constructor(id: string, featureData: Identifier | undefined) {
    let data;

    if (featureData === undefined) {
      data = query(id);
    } else {
      data = featureData;
    }

    if (!isFeatureData(data)) {
      throw `${id} is not valid feature`;
    }

    this.id = id;
    this.data = data;
  }

  toString() {
    return `[Feature ${this.id}]`;
  }

  supportedBy(): Release[] {
    const support = this.data?.__compat?.support;
    if (support === undefined) {
      throw Error("This feature contains no __compat object.");
    }

    const result = [];

    for (const [id, statementOrStatements] of Object.entries(support)) {
      const rawStatements = Array.isArray(statementOrStatements)
        ? statementOrStatements
        : [statementOrStatements];

      for (const raw of rawStatements) {
        const s = statement(raw, id as BrowserName, this);

        if (!(s instanceof RealSupportStatement)) {
          throw Error(
            `${feature} contains non-real values. Cannot expand support.`,
          );
        }

        // TODO: Unroll this method a bit, so it calls another method that returns one browser at a time.
        //       It'll be easier to ignore caveats that don't matter.
        // TODO: Only print caveats warning when result is `[]`.
        // TODO: Add a getter for `Browser` that makes it possible to `browser.name` instead of peering at the BCD directly.
        if (s.hasCaveats() && typeof s.browser === "string") {
          const { name } = browser(s.browser).data;
          const message = `${this} has support caveats in ${name} and may be deemed unsupported. Check underlying compat data for details.`;
          console.warn(message);
        }

        result.push(...s.supportedBy());
      }
    }

    return result;
  }
}
