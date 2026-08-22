#!/usr/bin/env node
/**
 * Fails if a dependency has gained an install script that is not on the
 * allowlist below.
 *
 * Why this exists: a postinstall runs arbitrary Node on every machine that
 * installs this project, including the deployment build, and nothing else in
 * the toolchain looks at them. `npm audit` reports known advisories, not
 * execution surface. gitleaks reads content, not lifecycle hooks. A dependency
 * can acquire a postinstall in a patch release and nothing would say so.
 *
 * This is a change detector, not a judgement. Everything on the allowlist has
 * been read and understood. When this fails, read the new script before adding
 * it, and record what it does.
 *
 * Note that CI installs with --ignore-scripts, so nothing here executes there.
 * This check is about knowing what would run elsewhere, on a contributor's
 * machine or in a deployment build that does not pass that flag.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Reviewed and understood. Keep the reason with the entry, so the next person
 * to see a failure knows what standard the allowlist was held to.
 */
const ALLOWED = new Map([
  [
    "node_modules/fsevents",
    "macOS file watching, optional and never installed on Linux CI or on the deployment builder.",
  ],
  [
    "node_modules/unrs-resolver",
    "Native binding loader behind eslint-import-resolver-typescript, itself behind eslint-config-next. " +
      "Its postinstall resolves the platform binary that npm has already installed via optionalDependencies " +
      "and exits. It only reaches the network when that resolution fails, which is the --no-optional case. " +
      "Verified as a no-op here: running it changed nothing on disk, and a full --ignore-scripts install " +
      "still passes lint, tests and build.",
  ],
]);

const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8"));

const found = Object.entries(lock.packages ?? {})
  .filter(([, meta]) => meta.hasInstallScript)
  .map(([path, meta]) => ({ path, version: meta.version, dev: Boolean(meta.dev) }));

const unexpected = found.filter((pkg) => !ALLOWED.has(pkg.path));
const missing = [...ALLOWED.keys()].filter(
  (path) => !found.some((pkg) => pkg.path === path),
);

for (const pkg of found) {
  const status = ALLOWED.has(pkg.path) ? "allowed" : "UNEXPECTED";
  console.log(
    `  ${status.padEnd(10)} ${pkg.path}@${pkg.version} ${pkg.dev ? "(dev)" : "(PRODUCTION)"}`,
  );
}

if (missing.length) {
  // Not a failure. An allowlist entry that no longer matches anything is stale
  // rather than dangerous, but it should not be left to rot.
  console.log(
    `\nAllowlist entries no longer present, safe to remove:\n  ${missing.join("\n  ")}`,
  );
}

if (unexpected.length) {
  console.error(
    `\n${unexpected.length} dependency install script(s) not on the allowlist:\n` +
      unexpected.map((p) => `  ${p.path}@${p.version}`).join("\n") +
      "\n\nA package gained a postinstall, or a new one arrived carrying one. Read what\n" +
      "it does before allowing it, then add it to ALLOWED in this file with a note.\n" +
      "Any production (non-dev) entry deserves particular scrutiny, since it runs\n" +
      "wherever the app is built.\n",
  );
  process.exit(1);
}

console.log(`\n${found.length} install script(s), all reviewed and allowed.`);
