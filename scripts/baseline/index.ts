import yargs from "yargs";

import { printHuman, printMarkdown, printYAML } from "./print";
import { calculateCumulativeStatus } from "./calculate-status";
import { reportFeature } from "./calculate-status";

const argv = yargs(process.argv.slice(2))
  .command(
    "$0 <features..>",
    "Check the Baseline status of one or more BCD features",
    (yargs) => {
      yargs.positional("features", {
        describe: "One or more @mdn/browser-compat-data feature keys",
        type: "array",
        demandOption: true,
      });
      yargs.boolean("markdown");
      yargs.option("group-as", {
        describe: "Group subsequent keys under a specific name.",
        type: "string",
        nargs: 1,
      });
      yargs.option("yaml", {
        describe: "Print results as YAML that can be pasted in web-features",
        type: "boolean",
      });
    },
  )
  .help().argv;

function main() {
  const feats: string[] = argv.features;
  const reports = feats.map((f) => reportFeature(f));
  const cumulative = calculateCumulativeStatus(
    reports,
    argv.groupAs ?? "cumulative",
  );

  if (argv.markdown) {
    printMarkdown(cumulative, argv.groupAs ?? "cumulative");
    process.exit(0);
  }

  if (argv.yaml) {
    printYAML(cumulative);
    process.exit(0);
  }

  for (const r of reports) {
    printHuman(r);
  }
}

main();
