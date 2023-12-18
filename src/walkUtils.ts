import {
  isBrowserStatement,
  isCompatData,
  isCompatStatement,
  isFeatureData,
  isMetaBlock,
} from "./typeUtils";

export function descendantKeys(data: unknown, path?: string): string[] {
  if (isCompatData(data)) {
    return [
      "api",
      "css",
      "html",
      "http",
      "javascript",
      "mathml",
      "svg",
      "webassembly",
      "webdriver",
      "webextensions",
    ];
  }

  if (isMetaBlock(data)) {
    return [];
  }

  if (isCompatStatement(data)) {
    console.log(`${path} is CompatStatement`);
    return [];
  }

  if (isBrowserStatement(data)) {
    console.log(`${path} is BrowserStatement`);
    return [];
  }

  if (isFeatureData(data)) {
    return Object.keys(data).filter((key) => key !== "__compat");
  }

  throw Error(
    `Unhandled traverse into descendants of object at ${path ?? "[root]"}.`,
  );
}
