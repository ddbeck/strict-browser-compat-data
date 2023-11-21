import { query } from "./query";

export function browser(name: string): void {
  const data = query(`browsers.${name}`);
  console.log(data);
}
