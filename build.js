// ============================================================
// build.js — Bundle, minify, obfuscate
// Usage:  node build.js          (production — obfuscated)
//         node build.js --dev    (fast dev — minified only)
// ============================================================

const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isDev = process.argv.includes('--dev');

// Ensure dist directories exist
fs.mkdirSync('dist/js',  { recursive: true });
fs.mkdirSync('dist/css', { recursive: true });

async function build() {
  const t0 = Date.now();

  // ── Step 1: Bundle JS with esbuild ──
  console.log('  Bundling JS...');
  const result = await esbuild.build({
    entryPoints: ['src/js/main.js'],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2020'],
    outfile: 'dist/js/bundle.js',
    sourcemap: false,
    legalComments: 'none',
    write: true,
  });

  if (result.errors.length) {
    console.error('esbuild errors:', result.errors);
    process.exit(1);
  }

  const bundled = fs.readFileSync('dist/js/bundle.js', 'utf-8');
  console.log(`  Bundle: ${(bundled.length / 1024).toFixed(1)} KB`);

  // ── Step 2: Obfuscate (production only) ──
  let finalJS;
  if (isDev) {
    finalJS = bundled;
    console.log('  Skipping obfuscation (--dev)');
  } else {
    console.log('  Obfuscating...');
    const obfuscated = JavaScriptObfuscator.obfuscate(bundled, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.4,
      deadCodeInjection: false,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      selfDefending: false,
      splitStrings: true,
      splitStringsChunkLength: 8,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.7,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    });
    finalJS = obfuscated.getObfuscatedCode();
    console.log(`  Obfuscated: ${(finalJS.length / 1024).toFixed(1)} KB`);
  }

  fs.writeFileSync('dist/js/bundle.min.js', finalJS);

  // Clean up intermediate file
  if (fs.existsSync('dist/js/bundle.js')) {
    fs.unlinkSync('dist/js/bundle.js');
  }

  // ── Step 3: Minify CSS ──
  console.log('  Minifying CSS...');
  try {
    execSync('npx cleancss -o dist/css/styles.min.css src/css/styles.css', {
      stdio: 'pipe',
    });
    const cssSize = fs.statSync('dist/css/styles.min.css').size;
    console.log(`  CSS: ${(cssSize / 1024).toFixed(1)} KB`);
  } catch (e) {
    console.error('CSS minification failed:', e.message);
    // Fallback: just copy
    fs.copyFileSync('src/css/styles.css', 'dist/css/styles.min.css');
  }

  // ── Done ──
  const elapsed = Date.now() - t0;
  console.log(`\n  Build complete in ${elapsed}ms ${isDev ? '(dev)' : '(production)'}`);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
