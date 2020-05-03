import {join} from 'path';
import {cleanPlugin} from '@alorel/rollup-plugin-clean';
import {copyPkgJsonPlugin} from "@alorel/rollup-plugin-copy-pkg-json";
import {copyPlugin} from "@alorel/rollup-plugin-copy";
import nodeResolve from '@rollup/plugin-node-resolve';
import {promises as fs} from 'fs';
import {threadedTerserPlugin} from "@alorel/rollup-plugin-threaded-terser";
import {dtsPlugin} from '@alorel/rollup-plugin-dts';
import * as pkgJson from './package.json';
import {fastTscPlugin} from "@alorel/rollup-plugin-fast-tsc";

const umdName = 'PreactStaticComponent';
const umdGlobals = {
  preact: 'preact'
};

const distDir = join(__dirname, 'dist');
const srcDir = join(__dirname, 'src');
const bundleDir = join(distDir, 'bundle');

const clean$ = cleanPlugin({dir: distDir});
const banner$ = fs.readFile(join(__dirname, 'LICENSE'), 'utf8')
  .then(f => `/*\n${f.trim()}\n*/\n`);

function mkNodeResolve() {
  return nodeResolve({
    mainFields: ['fesm5', 'esm5', 'module', 'browser', 'main'],
    extensions: ['.js', '.ts']
  });
}

const baseInput = join(srcDir, 'index.ts');

const baseSettings = {
  input: join(srcDir, 'index.ts'),
  external: Array.from(
    new Set(
      Object.keys(Object.keys(pkgJson.dependencies || {}))
        .concat(Object.keys(pkgJson.peerDependencies || {}))
        .filter(p => !p.startsWith('@types/'))
    )
  ),
  preserveModules: true,
  watch: {
    exclude: 'node_modules/*'
  }
}

const baseOutput = {
  entryFileNames: '[name].js',
  sourcemap: false,
  dir: distDir
};

export default ({watch}) => [
  {
    ...baseSettings,
    input: baseInput,
    output: {
      ...baseOutput,
      format: 'cjs',
      plugins: [
        copyPkgJsonPlugin({
          unsetPaths: ['devDependencies', 'scripts']
        }),
        dtsPlugin({
          cliArgs: ['--rootDir', 'src']
        }),
      ]
    },
    plugins: [
      clean$,
      copyPlugin({
        defaultOpts: {
          glob: {
            cwd: __dirname
          },
          emitNameKind: 'fileName'
        },
        copy: [
          'LICENSE',
          'CHANGELOG.md',
          'README.md'
        ]
      }),
      mkNodeResolve(),
      fastTscPlugin({watch})
    ]
  },
  {
    ...baseSettings,
    input: baseInput,
    output: {
      ...baseOutput,
      format: 'es',
      entryFileNames: '[name].esm2015.js'
    },
    plugins: [
      mkNodeResolve(),
      fastTscPlugin()
    ]
  },
  {
    ...baseSettings,
    input: baseInput,
    output: {
      ...baseOutput,
      format: 'es',
      entryFileNames: '[name].esm5.js',
    },
    plugins: [
      mkNodeResolve(),
      fastTscPlugin({extraCliArgs: ['--target', 'es5']})
    ]
  },
  {
    ...baseSettings,
    preserveModules: false,
    output: (() => {
      const base = {
        ...baseOutput,
        banner: () => banner$,
        name: umdName,
        globals: umdGlobals,
        dir: bundleDir,
        format: 'umd'
      }

      return [
        {
          ...base,
          entryFileNames: 'umd.js'
        },
        {
          ...base,
          entryFileNames: 'umd.min.js',
          plugins: [
            threadedTerserPlugin({
              terserOpts: {
                compress: {
                  drop_console: true,
                  keep_infinity: true,
                  typeofs: false,
                  ecma: 5
                },
                ecma: 5,
                ie8: true,
                mangle: {
                  safari10: true
                },
                output: {
                  comments: false,
                  ie8: true,
                  safari10: true
                },
                safari10: true,
                sourceMap: false
              }
            })
          ]
        }
      ]
    })(),
    plugins: [
      mkNodeResolve(),
      fastTscPlugin({extraCliArgs: ['--target', 'es5']})
    ]
  }
];
