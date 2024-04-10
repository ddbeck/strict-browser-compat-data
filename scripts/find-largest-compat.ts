import { Compat, walk } from "../src/browser-compat-data/index";

const compat = new Compat();

const featsBySize = new Map<number, string[]>();

for (const { path, data } of walk(
  ["api", "css", "javascript", "html"],
  compat.data as any,
)) {
  const size = JSON.stringify(data.__compat, undefined, 2).split("\n").length;
  featsBySize.set(size, [...(featsBySize.get(size) ?? []), path]);
}

const sorted = [...featsBySize.entries()].sort((a, b) => a[0] - b[0]);

for (const [count, keys] of sorted.slice(sorted.length - 10, sorted.length)) {
  console.log(`${count}: ${keys.length} Ex: ${JSON.stringify(keys)}`);
}

for (const [count, keys] of sorted.slice(0, 10)) {
  console.log(`${count}: ${keys.length} Ex: "${JSON.stringify(keys[0])}"`);
}

featsBySize.get(49)?.map((a) => console.log(a));
