#!/usr/bin/env node
import dotenv from "dotenv-flow";
dotenv.config();

import fs from "fs";
import yargs from "yargs";

function readJsonFile(file) {
  return JSON.parse(fs.readFileSync(file));
}

yargs
  .command({
    command: "bulk-close <file>",
    desc: "Bulk close a list of issues",
    handler: (argv) => {
      (async () => {
        const handler = await import("./bulk-close.mjs");
        const config = readJsonFile(argv.file);
        await handler.action.run(config);
      })();
    },
  })
  .command({
    command: "transition <file>",
    desc: "Run transition for a list of issues",
    handler: (argv) => {
      (async () => {
        const handler = await import("./transition.mjs");
        const config = readJsonFile(argv.file);
        await handler.action.run(config);
      })();
    },
  })
  .demandCommand(
    1,
    "You need to specify a command. Try one of [bulk-close, transition]"
  )
  .alias("v", "version")
  .version(readJsonFile("package.json").version)
  .describe("v", "show version information")
  .help().argv;
