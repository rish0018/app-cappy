// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// pnpm monorepo: allow Metro to resolve workspace packages hoisted at the root.
// node-linker=hoisted (see root .npmrc) gives a flat, npm-like node_modules
// layout, so Metro's normal upward directory walk finds hoisted deps like
// expo-router on its own   do NOT set disableHierarchicalLookup or a custom
// server.unstable_serverRoot here, both break the dev-client's relative entry
// path resolution against this hoisted layout.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

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
