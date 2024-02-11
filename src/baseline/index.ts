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
  baseline_high_date: string | null;
  toJSON: () => string;
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
  let baseline_high_date = null;
  if (isBaselineLow) {
    const initialReleases = [...s.entries()].map(([, r]) => r);
    const keystoneRelease = initialReleases
      .sort((a, b) => {
        assert(a !== undefined);
        assert(b !== undefined);
        return a.date().getTime() - b.date().getTime();
      })
      .pop();

    assert(keystoneRelease instanceof Release);
    baseline_low_date = keystoneRelease.date().toISOString().slice(0, 10);

    if (isBaselineHigh) {
      const date = keystoneRelease.date();
      // TODO: Explicitly define end-of-month and leap day behavior. This trusts
      // Date to do the right thing, which is probably fine but potentially
      // surprising.
      date.setMonth(date.getMonth() + 30);
      baseline_high_date = date.toISOString().slice(0, 10);
    }
  }

  return {
    baseline,
    baseline_low_date,
    baseline_high_date,
    support: s,
    toJSON: function () {
      return jsonify(this);
    },
  };
}

function jsonify(status: SupportStatus): string {
  const { baseline_low_date, baseline_high_date } = status;
  const support: Record<string, string> = {};

  for (const [browser, release] of status.support.entries()) {
    if (release !== undefined) {
      support[browser.id] = release.version;
    }
  }

  if (status.baseline === "high") {
    return JSON.stringify(
      {
        baseline: status.baseline,
        baseline_low_date,
        baseline_high_date,
        support,
      },
      undefined,
      2,
    );
  }

  if (status.baseline === "low") {
    return JSON.stringify(
      {
        baseline: status.baseline,
        baseline_low_date,
        support,
      },
      undefined,
      2,
    );
  }

  return JSON.stringify(
    {
      baseline: status.baseline,
      support,
    },
    undefined,
    2,
  );
}
