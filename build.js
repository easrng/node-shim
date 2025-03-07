// @ts-check
const { mkdirSync, writeFileSync, existsSync, rmSync } = require("fs");
const { resolve, basename, relative } = require("path");
const { builtinModules } = require("module");
const dist = resolve(__dirname, "dist");
if (existsSync(dist)) rmSync(dist, { force: true, recursive: true });
mkdirSync(dist);
for (const module of builtinModules) {
  const keys = Object.keys(process.getBuiltinModule("node:" + module) || {});
  mkdirSync(resolve(dist, module, ".."), { recursive: true });
  writeFileSync(
    resolve(dist, module + ".js"),
    `module.exports = process.getBuiltinModule(${
      JSON.stringify(
        "node:" + module,
      )
    })` +
      (module === "module"
        ? `\nconst syncRegistry = require("../lib/syncRegistry.js");\nif (module.exports.syncBuiltinESMExports) syncRegistry.register(module.exports.syncBuiltinESMExports)\nmodule.exports.syncBuiltinESMExports = syncRegistry.sync`
        : ""),
  );
  writeFileSync(
    resolve(dist, module + ".d.ts"),
    `export = require(${JSON.stringify("node:" + module)})`,
  );
  writeFileSync(
    resolve(dist, module + ".mjs"),
    `import _mod from ${
      JSON.stringify(
        "./" + basename(module) + ".js",
      )
    }\nexport default _mod` +
      (keys.length
        ? `\nexport let ${
          keys.join(
            ", ",
          )
        }\nimport _syncRegistry from ${
          JSON.stringify(
            relative(
              resolve(dist, module, ".."),
              resolve(__dirname, "lib/syncRegistry.js"),
            ),
          )
        }\nfunction _sync() {\n  ({${
          keys.join(
            ", ",
          )
        }} = _mod)\n}\n_syncRegistry.register(_sync)\n` +
          (module === "module"
            ? `\nif (_mod.syncBuiltinESMExports)_syncRegistry.register(_mod.syncBuiltinESMExports)\n_mod.syncBuiltinESMExports = _syncRegistry.sync\n`
            : "") +
          "_sync()"
        : ""),
  );
  writeFileSync(
    resolve(dist, module + ".d.mts"),
    `import _mod = require(${
      JSON.stringify(
        "node:" + module,
      )
    })\nexport { _mod as default }\n` +
      (keys.length
        ? `export {${keys.join(", ")}} from ${
          JSON.stringify(
            "node:" + module,
          )
        }\n`
        : ""),
  );
}
writeFileSync(
  resolve(__dirname, "package.json"),
  JSON.stringify(
    {
      ...require("./package.json"),
      exports: Object.fromEntries(
        builtinModules.map((module) => [
          "./" + module,
          {
            require: "./dist/" + module + ".js",
            default: "./dist/" + module + ".mjs",
          },
        ]),
      ),
    },
    null,
    2,
  ),
);
