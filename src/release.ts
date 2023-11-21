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
}
