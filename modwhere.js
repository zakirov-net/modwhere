#!/usr/bin/env node
const fs = require('fs');

const ROOT_DIR = 'E:';
const metaPathResolver = (rootDir, standDir) => `${rootDir}/${standDir}/inside/online-inside/meta.info`;

class MyError extends Error {}

try {
    const moduleName = getModuleName();
    const fileSearcher = getFileSearcher(ROOT_DIR);
    const lastStandDir = fileSearcher.getLastStandDir();
    const metaFilePath = fileSearcher.getMetaFilePath(lastStandDir);
    const metaFileContent = fs.readFileSync(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaFileContent);
    const { mod, repoName, repo } = findModule(moduleName, metaData.application.repos);

    console.log(`Модуль: ${moduleName}`);
    console.log(`Репозиторий: ${repoName}`);
    console.log(`Ответственный: ${mod.responsible}`);
    console.log(`ULR: ${repo.url_http.replace(/\.git$/, '')}`);
} catch (err) {
    if (err instanceof MyError) {
        console.log(err.message);
        process.exit(1);
    }
    throw err;
}

function getModuleName() {
    const moduleName = process.argv[2];
    if (!moduleName) {
        throw new MyError('Не задано имя модуля');
    }
    return moduleName;
}

function getFileSearcher(rootDir) {
    function getMetaFilePath(standDir) {
        return metaPathResolver(rootDir, standDir);
    }

    function getLastStandDir() {
        const files = fs.readdirSync(rootDir);
        const standDirs = files.filter((file) => fs.existsSync(getMetaFilePath(file))).sort();
        if (!standDirs.length) {
            throw new MyError('Нет папок со стендом');
        }
        const lastStandDir = standDirs[standDirs.length - 1];
        return lastStandDir;
    }

    return {
        getMetaFilePath,
        getLastStandDir
    };
}

function findModule(moduleName, repos) {
    for (const [repoName, repo] of Object.entries(repos)) {
        for (const mod of repo.module) {
            if (mod.name === moduleName) {
                return {mod, repo, repoName};
            }
        }
    }
    throw new MyError(`Не найден модуль ${moduleName}`);
}
