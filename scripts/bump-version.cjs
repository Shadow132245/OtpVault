const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node scripts/bump-version.js <version>');
  console.error('Example: node scripts/bump-version.js 0.2.2');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Version must be semver format (e.g., 0.2.2)');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');

const files = [
  { file: 'package.json', find: /"version":\s*"[^"]*"/, replace: `"version": "${version}"` },
  { file: 'src-tauri/tauri.conf.json', find: /"version":\s*"[^"]*"/, replace: `"version": "${version}"` },
  { file: 'src-tauri/tauri.android.conf.json', find: /"version":\s*"[^"]*"/, replace: `"version": "${version}"` },
  { file: 'src-tauri/Cargo.toml', find: /version\s*=\s*"[^"]*"/, replace: `version = "${version}"` },
  { file: 'landing/version.json', find: /"version":\s*"[^"]*"/, replace: `"version": "${version}"` },
];

let updated = 0;
for (const { file, find, replace } of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  SKIP: ${file} (not found)`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  if (find.test(content)) {
    content = content.replace(find, replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  OK: ${file}`);
    updated++;
  } else {
    console.warn(`  SKIP: ${file} (pattern not found)`);
  }
}

console.log(`\nUpdated ${updated}/${files.length} files to v${version}`);
