import { markdownTable } from "markdown-table";
import { stringify } from "yaml";

import { Release } from "../../src/release";
import { StatusReport, CumulativeStatusReport } from "./calculate-status";
import { feature } from "../../src/feature";

type BrowserIdentifier =
  | "chrome"
  | "chrome_android"
  | "edge"
  | "firefox"
  | "firefox_android"
  | "safari"
  | "safari_ios";

type SupportBreakdown = { [K in BrowserIdentifier]?: string };

type YAMLBaselineStatus = {
  status: {
    baseline: "high" | "low" | false;
    baseline_low_date?: string;
    support: SupportBreakdown;
  };
};

export function printYAML(cumulative: CumulativeStatusReport): void {
  const yaml: YAMLBaselineStatus = (function () {
    const support: SupportBreakdown = {};
    for (const [browser, release] of cumulative.support.entries()) {
      if (!release?.isPrerelease()) {
        support[browser.id] = release?.version;
      }
    }

    const result: YAMLBaselineStatus = {
      status: {
        baseline: cumulative.baseline,
        baseline_low_date: formatKeystoneDate(cumulative),
        support,
      },
    };

    if (result.status.baseline_low_date === "") {
      delete result.status.baseline_low_date;
    }

    return result;
  })();

  console.log(stringify(yaml));
}

export function printHuman(report: StatusReport): void {
  const { id, baseline, baseline_low_date, baseline_low_release, support } =
    report;
  const statusEmoji = formatIndicator(report);
  console.log(`${statusEmoji} ${id}`);
  for (const [key, value] of support.entries()) {
    console.log(
      `\t${key.id}: ${value ? value.version : "null"} \t\t${value
        ?.date()
        .toISOString()
        .slice(0, 10)}`,
    );
  }
  console.log(
    `\tbaseline_low_date: ${
      baseline ? baseline_low_date?.toISOString() : false
    }${baseline_low_release ? ` ${baseline_low_release}` : ""}`,
  );
}

function formatIndicator(report: StatusReport): string {
  if (report.baseline === "high") {
    return "✅ High";
  }
  if (report.baseline === "low") {
    return "🆕 Low";
  }
  return "❌ Not Baseline";
}

function formatKeystoneDate(report: StatusReport): string {
  if (report.baseline_low_date) {
    return report.baseline_low_date.toISOString().slice(0, 10);
  }
  return "";
}

function formatVersion(browser, report): string {
  const release: Release | undefined = report.support.get(browser);

  let text = `${browser.name}`;
  if (release === undefined) {
    return `${text} ❌`;
  }

  text = `${text} ${release.version}`;
  if (release === report.baseline_low_release) {
    return `${text} 🔑💎`;
  }

  if (release.isPrerelease()) {
    return `${text} 🚧`;
  }

  return text;
}

export function printMarkdown(
  cumulative: CumulativeStatusReport,
  id?: string,
): void {
  const heading: string[] = ["Key", "Baseline", "Low since date", "Versions"];
  const rows: string[][] = [];
  const browserSet = [...cumulative.support.keys()];

  rows.push([
    `**${cumulative.id}**`,
    formatIndicator(cumulative),
    formatKeystoneDate(cumulative),
    browserSet.map((b) => formatVersion(b, cumulative)).join("<br>"),
  ]);

  for (const report of cumulative.subreports) {
    const url = feature(report.id).data.__compat?.mdn_url;
    const linkText = url
      ? `[\`${report.id}\`](${url}#browser_compatibility)`
      : `\`${report.id}\``;

    rows.push([
      linkText,
      formatIndicator(report),
      formatKeystoneDate(report),
      browserSet.map((b) => formatVersion(b, report)).join("<br>"),
    ]);
  }

  const table = markdownTable([heading, ...rows], { align: ["l", "c", "l"] });
  const legend = [
    table.includes("🔑💎")
      ? "🔑💎 marks a release that contributes to the Baseline low date.<br>"
      : undefined,
    table.includes("🚧")
      ? "🚧 marks a prerelease (nominally unsupported).<br>"
      : undefined,
  ]
    .filter((line) => !!line)
    .join("\n");

  console.log(`## ${id}`);
  console.log();
  console.log(table);
  console.log();
  console.log(legend);
  console.log();
}