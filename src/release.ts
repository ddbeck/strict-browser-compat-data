import { ReleaseStatement } from "@mdn/browser-compat-data";
import { Browser } from "./browser";

export class Release {
  browser: Browser;
  version: string;
  data: ReleaseStatement;

  constructor(browser: Browser, version: string, data: ReleaseStatement) {
    this.browser = browser;
    this.version = version;
    this.data = data;
  }

  toString() {
    return `[${this.browser.data.name} ${this.version}]`;
  }

  date(): Date {
    const { release_date } = this.data;
    if (release_date === undefined) {
      return new Date(NaN);
    }

    return new Date(release_date);
  }

  compare(otherRelease: Release) {
    if (otherRelease.browser !== this.browser) {
      throw Error(
        `Cannot compare releases of differing browsers (${this.browser} versus ${otherRelease.browser})`,
      );
    }

    const index = this.browser.releases().indexOf(this);
    const otherIndex = this.browser.releases().indexOf(otherRelease);

    if (index < otherIndex) {
      return -1;
    } else if (index > otherIndex) {
      return 1;
    }
    return 0;
  }
}
