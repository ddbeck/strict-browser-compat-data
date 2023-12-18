import fs from "node:fs";
import path from "node:path";

import yaml from "yaml";
import {
  CumulativeStatusReport,
  calculateCumulativeStatus,
  reportFeature,
} from "./calculate-status";
import { formatKeystoneDate } from "./print";

export function handler(argv) {
  const yamlPaths: string[] = argv.yaml;

  for (const yamlPath of yamlPaths) {
    const source: string = fs.readFileSync(yamlPath, { encoding: "utf-8" });
    const id: string = path.basename(yamlPath, ".yml");
    const document = yaml.parseDocument(source);

    if (document.contents === null || !yaml.isMap(document.contents)) {
      console.error(
        `${yamlPath} is malformed. Is this a valid a web-features file?`,
      );
      process.exit(1);
    }

    const { status, compat_features } = document.toJSON();
    if (argv.updateOnly && !status) {
      console.error(`${id} has no status already. Skipping.`);
      continue;
    }

    let statusReport: CumulativeStatusReport;
    if (Array.isArray(compat_features)) {
      try {
        statusReport = calculateCumulativeStatus(
          compat_features.map((f) => reportFeature(f)),
          id,
        );
      } catch (err) {
        if (err.message.includes("unindexable")) {
          console.error(`${id} contains a non-existent feature. Skipping.`);
          continue;
        }
        throw err;
      }
    } else if (compat_features === undefined) {
      // throw Error("Not implemented: getting compat features from BCD tags");
      console.error(`Skipping ${id}, no compat_features`);
      continue;
    } else {
      // throw Error("Not implemented: handling empty or nonexist feature list");
      console.error(`Skipping ${id}, no compat_features`);
      continue;
    }
    // Update the existing status (or just append to the end if there's no compat_features array)
    if (status || !("compat_features" in document.toJSON())) {
      document.set("status", shrinkReport(statusReport));
    } else {
      // Place the new status before the compat_features array, if it exists
      const statusNode = document.createPair(
        "status",
        shrinkReport(statusReport),
      );
      document.add(statusNode);
      const items = document.contents.items;

      const fromIndex = items.findIndex(
        (item) => yaml.isScalar(item.key) && item.key.value === "status",
      );
      const toIndex = items.findIndex(
        (item) =>
          yaml.isScalar(item.key) && item.key.value === "compat_features",
      );
      items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
    }

    if (argv.write === true) {
      fs.writeFileSync(yamlPath, document.toString(), { encoding: "utf-8" });
    } else {
      console.log(document.toString());
    }
  }
}

type BrowserIdentifier =
  | "chrome"
  | "chrome_android"
  | "edge"
  | "firefox"
  | "firefox_android"
  | "safari"
  | "safari_ios";

type SupportBreakdown = { [K in BrowserIdentifier]?: string };

// TODO: Try this with two interfaces, YAMLBaseline and YAMLNonBaseline
type YAMLStatus = {
  baseline: "high" | "low" | false;
  baseline_low_date?: string;
  support: SupportBreakdown;
};

function shrinkReport(report: CumulativeStatusReport): YAMLStatus {
  const support: SupportBreakdown = {};

  for (const [browser, release] of report.support.entries()) {
    if (!release?.isPrerelease()) {
      support[browser.id] = release?.version;
    }
  }

  const result: YAMLStatus = {
    baseline: report.baseline,
    baseline_low_date: formatKeystoneDate(report),
    support,
  };

  if (result.baseline_low_date === "") {
    delete result.baseline_low_date;
  }

  return result;
}
