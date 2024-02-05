import assert from "node:assert";
import { feature } from "../browser-compat-data/feature";
import { Release } from "../browser-compat-data/release";
import { browsers, highReleases, lowReleases } from "./core-browser-set";
import { support } from "./support";
import { Browser } from "../browser-compat-data/browser";

interface FeatureSelector {
  compatKey: string;
}

interface SupportStatus {
  baseline: "low" | "high" | false;
  baseline_low_date: string | null;
  support: Map<Browser, Release | undefined>;
}

export function computeBaseline(
  featureSelector: FeatureSelector,
): SupportStatus {
  const { compatKey } = featureSelector;
  const f = feature(compatKey);
  const s = support(f, browsers);

  const allReleases = f.supportedBy();
  const isBaselineLow = lowReleases.every((r) => allReleases.includes(r));
  const isBaselineHigh = highReleases.every((r) => allReleases.includes(r));

  const baseline =
    (isBaselineHigh ? "high" : false) || (isBaselineLow ? "low" : false);

  let baseline_low_date = null;
  if (isBaselineLow) {
    const initialReleases = [...s.entries()].map(([, r]) => r);
    const lastInitialRelease = initialReleases
      .sort((a, b) => {
        assert(a !== undefined);
        assert(b !== undefined);
        return a.date().getTime() - b.date().getTime();
      })
      .pop();

    assert(lastInitialRelease instanceof Release);
    baseline_low_date = lastInitialRelease?.date().toISOString().slice(0, 10);
  }

  return {
    baseline,
    baseline_low_date,
    support: s,
  };
}
