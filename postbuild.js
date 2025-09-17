// postbuild.js
// Copies data directory to dist after build
const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.join(__dirname, "data");
const destDir = path.join(__dirname, "dist", "data");
copyRecursiveSync(srcDir, destDir);
console.log("Copied data/ to dist/data/");
