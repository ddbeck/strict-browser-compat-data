import { Identifier } from "@mdn/browser-compat-data";

import { Browser, browser } from "./browser";
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

  _supportedBy(browser: Browser): Release[] {
    const support = this.data?.__compat?.support;
    if (support === undefined) {
      throw Error("This feature contains no __compat object.");
    }

    const statementOrStatements = support[browser.id];

    if (statementOrStatements === undefined) {
      throw Error(`${this} contains no support data for ${browser.name}`);
    }

    const rawStatements = Array.isArray(statementOrStatements)
      ? statementOrStatements
      : [statementOrStatements];

    const releases: Release[] = [];
    const caveats: string[] = [];

    for (const raw of rawStatements) {
      const s = statement(raw, browser.id, this);

      if (!(s instanceof RealSupportStatement)) {
        throw Error(
          `${feature} contains non-real values. Cannot expand support.`,
        );
      }
      // TODO: Add a getter for `Browser` that makes it possible to `browser.name` instead of peering at the BCD directly.
      if (s.hasCaveats()) {
        const { name } = browser.data;
        const message = `${this} has support caveats in ${name} and may be deemed unsupported. Check underlying compat data for details.`;
        caveats.push(message);
      }

      releases.push(...s.supportedBy());
    }

    if (releases.length === 0 && caveats.length > 0) {
      for (const message of caveats) {
        console.warn(message);
      }
    }

    return releases;
  }

  supportedBy(omit?: Browser[]): Release[] {
    const ignorables = new Set(omit);

    const browserIds = Object.keys(this.data?.__compat?.support || {});
    const browsers = browserIds.map((id) => browser(id));

    const result = [];
    for (const b of browsers) {
      if (!ignorables.has(b)) {
        result.push(...this._supportedBy(b));
      }
    }

    return result;
  }
}
