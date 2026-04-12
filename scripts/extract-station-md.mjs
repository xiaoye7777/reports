import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const dataAnalysisDir = path.join(
  projectRoot,
  "src",
  "hooks",
  "template",
  "dataAnalysis"
);
const assetsDir = path.join(projectRoot, "src", "assets");

function isEscaped(source, index) {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function collectTopLevelObjects(source) {
  const objects = [];
  let braceDepth = 0;
  let templateDepth = 0;
  let currentQuote = null;
  let objectStart = -1;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (currentQuote) {
      if (currentQuote === "`") {
        if (char === "$" && nextChar === "{" && !isEscaped(source, index)) {
          templateDepth += 1;
          index += 1;
          continue;
        }

        if (char === "}" && templateDepth > 0 && !isEscaped(source, index)) {
          templateDepth -= 1;
          continue;
        }

        if (char === "`" && templateDepth === 0 && !isEscaped(source, index)) {
          currentQuote = null;
        }

        continue;
      }

      if (char === currentQuote && !isEscaped(source, index)) {
        currentQuote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      currentQuote = char;
      continue;
    }

    if (char === "{") {
      if (braceDepth === 0) {
        objectStart = index;
      }

      braceDepth += 1;
      continue;
    }

    if (char === "}" && braceDepth > 0) {
      braceDepth -= 1;

      if (braceDepth === 0 && objectStart !== -1) {
        objects.push(source.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  return objects;
}

function parseStationSections(source) {
  const objects = collectTopLevelObjects(source);
  const sections = new Map();

  for (const objectText of objects) {
    const snMatch = objectText.match(/sn:\s*"([^"]+)"/);
    const contentMatch = objectText.match(/content:\s*`([\s\S]*?)`/);

    if (snMatch && contentMatch) {
      sections.set(snMatch[1], contentMatch[1].trim());
    }
  }

  return {
    info: sections.get("1"),
    conclusion: sections.get("3"),
  };
}

function normalizeBaseInfoContent(content) {
  return content
    .replace(/\$\{\s*(delivery_time|cap_req)\s*\?\?\s*""\s*\}/g, "${$1}")
    .replace(/\$\{\s*(date|summary_time|delivery_time|cap_req)\s*\}/g, "${$1}");
}

async function main() {
  const files = (await fs.readdir(dataAnalysisDir)).filter((file) => file.endsWith(".ts"));
  const results = [];

  for (const fileName of files) {
    const stationName = path.basename(fileName, ".ts");
    const templatePath = path.join(dataAnalysisDir, fileName);
    const templateSource = await fs.readFile(templatePath, "utf8");
    const { info, conclusion } = parseStationSections(templateSource);

    if (!info || !conclusion) {
      throw new Error(`Failed to extract sn "1" or sn "3" from ${fileName}`);
    }

    const stationAssetsDir = path.join(assetsDir, stationName);
    const oldMdDir = path.join(stationAssetsDir, "md");
    const noteDir = path.join(stationAssetsDir, "note");
    const normalizedInfo = normalizeBaseInfoContent(info);

    await fs.rm(oldMdDir, { recursive: true, force: true });
    await fs.mkdir(noteDir, { recursive: true });
    await fs.writeFile(path.join(noteDir, "base_info.txt"), normalizedInfo + "\n", "utf8");
    await fs.writeFile(path.join(noteDir, "climate.txt"), conclusion + "\n", "utf8");

    results.push({
      stationName,
      noteDir,
    });
  }

  for (const result of results) {
    console.log(`Generated note files for ${result.stationName}: ${result.noteDir}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
