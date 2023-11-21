import { BrowserName, BrowserStatement } from "@mdn/browser-compat-data";

import { query } from "./query";

export function browser(name: string): Browser {
  const data = query(`browsers.${name}`) as BrowserStatement;
  return new Browser(name as BrowserName, data);
}

export class Browser {
  id: BrowserName;
  data: Partial<BrowserStatement>;

  constructor(id: BrowserName, data: BrowserStatement) {
    this.id = id;
    this.data = data;
  }

  toString(): string {
    return `[Browser ${this.data.name}]`;
  }
}
