import { Identifier } from "@mdn/browser-compat-data";

import { query } from "./query";

export function feature(id: string, data?: Identifier): Feature {
  return new Feature(id, data);
}

export class Feature {
  id: string; // dotted.path.to.feature
  data: Identifier; // underlying BCD object

  constructor(id: string, data?: Identifier) {
    this.id = id;

    if (data === undefined) {
      this.data = query(id);
    } else {
      this.data = data;
    }
    if (!("__compat" in this.data)) {
      throw `${id} is not a valid feature`;
    }
  }
}
