import { browser, Browser } from "../../src/browser-compat-data/browser";
import { feature } from "../../src/browser-compat-data/feature";
import { Release } from "../../src/browser-compat-data/release";

const browserIgnoreList = [browser("ie")];

export type StatusReport = {
  id: string;
  baseline: "low" | "high" | false;
  baseline_low_date: Date | undefined;
  baseline_low_release: Release | undefined;
  support: Map<Browser, Release | undefined>;
};

export type CumulativeStatusReport = StatusReport & {
  subreports: StatusReport[];
};

export const coreBrowserSet = [
  browser("chrome"),
  browser("chrome_android"),
  browser("edge"),
  browser("firefox"),
  browser("firefox_android"),
  browser("safari"),
  browser("safari_ios"),
];

export function calculateCumulativeStatus(
  reports: StatusReport[],
  id?: string,
): CumulativeStatusReport {
  id = id ?? "cumulative";
  const baseline = cumulativeStatus(reports);
  const baseline_low_release = cumulativeBaselineLowRelease(reports);
  const baseline_low_date: Date | undefined = baseline_low_release?.date();
  const support = new Map<Browser, Release | undefined>();

  const browsers = new Set(
    reports.map((r) => Array.from(r.support.keys())).flat(),
  );
  for (const b of browsers.keys()) {
    support.set(b, supportIntroduced(b, reports));
  }

  return {
    id,
    baseline,
    baseline_low_date,
    baseline_low_release,
    support,
    subreports: reports,
  };
}

function cumulativeStatus(reports: StatusReport[]): "high" | "low" | false {
  if (reports.every((r) => r.baseline === "high")) {
    return "high";
  }
  if (reports.every((r) => !!r.baseline)) {
    return "low";
  }
  return false;
}

function cumulativeBaselineLowRelease(
  reports: StatusReport[],
): Release | undefined {
  if (reports.some((r) => r.baseline_low_release === undefined)) {
    return undefined;
  }

  const candidateReleases = reports.map(
    (r) => r.baseline_low_release,
  ) as Release[];
  candidateReleases.sort((a, b) => a.date().getTime() - b.date().getTime());

  return candidateReleases.at(-1);
}

function supportIntroduced(
  browser: Browser,
  reports: StatusReport[],
): Release | undefined {
  const releases: Release[] = [];

  for (const r of reports) {
    const release = r.support.get(browser);
    if (release === undefined) {
      return undefined;
    }
    releases.push(release);
  }

  releases.sort((a, b) => a.date().getTime() - b.date().getTime());

  return releases.at(-1);
}

export function reportFeature(id: string): StatusReport {
  const feat = feature(id);

  const supportingReleases = feat.supportedBy(browserIgnoreList);
  const coreBrowserSetReleases = supportingReleases.filter((rel) =>
    coreBrowserSet.includes(rel.browser),
  );

  const lowStatus = isBaselineLow(coreBrowserSetReleases);
  const highStatus = isBaselineHigh(coreBrowserSetReleases);
  const baseline = (highStatus ? "high" : false) || (lowStatus ? "low" : false);

  const support = new Map<Browser, Release | undefined>();
  for (const browser of coreBrowserSet) {
    support.set(browser, undefined);
  }

  for (const rel of coreBrowserSetReleases) {
    const currRel = support.get(rel.browser);

    if (!currRel || currRel.compare(rel) >= 0) {
      support.set(rel.browser, rel);
    }
  }

  let baseline_low_date: Date | undefined;
  let baseline_low_release: Release | undefined;

  if (baseline) {
    for (const rel of support.values()) {
      if (rel === undefined) {
        continue;
      }

      if (!baseline_low_date || rel.date() > baseline_low_date) {
        baseline_low_date = rel.date();
        baseline_low_release = rel;
      }
    }
  }

  const report = Object();
  report.id = id;
  report.baseline = baseline;
  if (report.baseline) {
    report.substatus = highStatus ? "high" : "low";
  }
  if (baseline_low_date) {
    report.baseline_low_date = baseline_low_date;
    report.baseline_low_release = baseline_low_release;
  }
  report.support = support;
  return report;
}

function isBaselineHigh(releases: Release[]): boolean {
  const supportSet = new Set(releases);
  return baselineHighReleases.every((r) => supportSet.has(r));
}

function isBaselineHighRelease(release: Release) {
  const baselineHighCutoff = new Date();
  baselineHighCutoff.setMonth(baselineHighCutoff.getMonth() - 30);
  return release.date() >= baselineHighCutoff;
}

const baselineHighReleases = coreBrowserSet
  .map((b) => b.releases().filter((r) => isBaselineHighRelease(r)))
  .flat();

function isBaselineLow(releases: Release[]): boolean {
  const supportSet = new Set(releases);
  return baselineLowReleases.every((r) => supportSet.has(r));
}

const baselineLowReleases = coreBrowserSet.map((b) => b.current());
