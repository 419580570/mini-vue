/* minist用啦解析命令行参数的 */
const args = require("minimist")(process.argv.slice(2))
const { build } = require("esbuild");
const { resolve } = require("path")

const target = args._[0] || "reactivity";
const format = args.f || "global";

/* 开发环境只打包某一个 */
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))

// iife 立即执行函数 (function(){})()
// cjs node中的模块 module.exports
// esm 浏览器中的esModule模块 import
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,
  sourcemap: false,
  format: outputFormat,
  globalName: pkg.buildOptions?.name,
  platform: format === 'cjs' ? 'node' : 'browser',
  watch: {
    onRebuild(error) {
      if (!error) console.log(`rebuilt~~~~`)
    }
  }
}).then(() => {
  console.log("watcing~~~")
})