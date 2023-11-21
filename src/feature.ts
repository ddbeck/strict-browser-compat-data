import { BrowserName, Identifier } from "@mdn/browser-compat-data";

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
        const s = statement(raw, id as BrowserName);
        if (!(s instanceof RealSupportStatement)) {
          throw Error(
            `${feature} contains non-real values. Cannot expand support.`,
          );
        }
        result.push(...s.supportedBy());
      }
    }

    return result;
  }
}
