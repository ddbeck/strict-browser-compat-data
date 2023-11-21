import { BrowserName, BrowserStatement } from "@mdn/browser-compat-data";

import { query } from "./query";
import { Release } from "./release";

export function browser(name: string): Browser {
  const data = query(`browsers.${name}`) as BrowserStatement;
  return new Browser(name as BrowserName, data);
}

export class Browser {
  id: BrowserName;
  data: BrowserStatement;
  _releases: Release[] | undefined;

  constructor(id: BrowserName, data: BrowserStatement) {
    this.id = id;
    this.data = data;
  }

  toString(): string {
    return `[Browser ${this.data.name}]`;
  }

  releases(): Release[] {
    if (this._releases === undefined) {
      if (this.data.releases === undefined) {
        // This shouldn't happe in practice, but we must appease the type checker
        throw Error(`${this} doesn't have releases data. That's weird.`);
      }

      this._releases = [];
      for (const [key, value] of Object.entries(this.data.releases)) {
        this._releases.push(new Release(this, key, value));
      }
    }

    return this._releases;
  }

  current(): Release {
    const curr = this.releases().find((r) => r.data.status === "current");

    if (curr === undefined) {
      throw Error(`${browser} does not have a "current" release`);
    }

    return curr;
  }
}
