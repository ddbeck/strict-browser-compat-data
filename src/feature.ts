import { Identifier } from "@mdn/browser-compat-data";

import { query } from "./query";
import { isFeatureData } from "./typeUtils";

export function feature(id: string, data?: Identifier): Feature {
  return new Feature(id, data);
}

export class Feature {
  id: string; // dotted.path.to.feature
  data: Identifier; // underlying BCD object

  constructor(id: string, featureData: Identifier | undefined) {
    let data;

    if (featureData === undefined) {
      data = query(id);
    } else {
      data = featureData;
    }

    if (!isFeatureData(data)) {
      throw `${id} is not valid feature`;
    }

    this.id = id;
    this.data = data;
  }

  toString() {
    return `[Feature ${this.id}]`;
  }

}
