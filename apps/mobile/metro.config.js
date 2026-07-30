const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// pnpm monorepo: allow Metro to resolve workspace packages hoisted at the root.
// node-linker=hoisted (see root .npmrc) gives a flat, npm-like node_modules
// layout for BARE-specifier imports (Node's own upward directory walk finds
// hoisted deps like expo-router fine -- confirmed via require.resolve).
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// BUT: the dev server's initial entry request for main: "expo-router/entry"
// is issued as a literal RELATIVE path -- "./node_modules/expo-router/entry"
// from this project's root -- not a bare specifier. Relative-path resolution
// never consults nodeModulesPaths/hierarchical lookup (that only applies to
// bare imports), so with pnpm's hoisted layout (apps/mobile/node_modules has
// no local expo-router -- everything's hoisted to the workspace root) this
// request 404s with "Unable to resolve module ./node_modules/expo-router/entry"
// even though require.resolve("expo-router/entry") succeeds fine from the
// same directory. Reproduced directly against a running Metro server before
// this fix, confirmed fixed after -- not a guess.
//
// Fix: when a "./node_modules/<pkg>/..." relative request doesn't exist
// locally, re-resolve it as a BARE specifier ("<pkg>/...") instead. Bare
// specifiers correctly consult nodeModulesPaths above (that's exactly why
// require.resolve("expo-router/entry") already succeeds from this same
// directory) -- relative paths never do, which is the actual bug.
const fs = require("fs");
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("./node_modules/")) {
    const localPath = path.resolve(projectRoot, moduleName);
    if (!fs.existsSync(localPath)) {
      const bareSpecifier = moduleName.replace("./node_modules/", "");
      return (defaultResolveRequest ?? context.resolveRequest)(context, bareSpecifier, platform);
    }
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

// tfjs-react-native model files (apps/mobile/assets/ml/asl-alphabet/) are
// bundled via require() + expo-asset (see src/ml/rnPredictor.ts), so Metro
// needs to treat .bin (tfjs weight shards) and .json (model topology +
// preprocessing config) as bundleable assets rather than trying to parse
// .json as a JS module in the ml/ directory specifically. .json is already
// handled as source by default elsewhere in the app, so only .bin is added
// here   model.json/preprocessing.json are loaded with require() the same
// way any other JSON asset already works in Metro.
if (!config.resolver.assetExts.includes("bin")) {
  config.resolver.assetExts.push("bin");
}

module.exports = config;
