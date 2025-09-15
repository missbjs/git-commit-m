#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = void 0;
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
function runCommand(command, options = {}) {
    try {
        const result = (0, child_process_1.execSync)(command, { encoding: 'utf-8', stdio: 'pipe', ...options });
        return result;
    }
    catch (error) {
        if (options.ignoreErrors) {
            return error.stdout || '';
        }
        throw error;
    }
}
async function commit(options) {
    const noAddDot = options.noAddDot || false;
    const promptArg = options.promptArg || '-p';
    const provider = options.provider || 'gemini';
    const diffFile = options.diff;
    const noCommit = options.noCommit || false;
    const startTime = Date.now();
    try {
        if (!noAddDot && !diffFile) {
            console.log(chalk_1.default.blue.bold('Adding all changes to git...'));
            runCommand('git add .');
        }
        let diff = '';
        if (diffFile) {
            console.log(chalk_1.default.blue.bold(`Reading diff from file: ${chalk_1.default.green.bold(diffFile)}...`));
            diff = fs.readFileSync(diffFile, 'utf-8');
        }
        else {
            diff = runCommand('git diff --cached', { ignoreErrors: true });
        }
        if (!diff.trim()) {
            console.log(chalk_1.default.yellow.bold('No changes to commit.'));
            process.exit(1);
        }
        const diffPath = path.join(process.cwd(), 'git_diff.txt');
        const prompt = 'Summarize this git diff into a clear commit message:';
        fs.writeFileSync(diffPath, `${prompt}\n${diff}`);
        let commitMessage = '';
        try {
            console.log(chalk_1.default.blue.bold(`Generating commit message with ${chalk_1.default.green.bold(provider)}...`));
            commitMessage = runCommand(`${provider} ${promptArg} "@${diffPath}"`, { ignoreErrors: true }).trim();
        }
        catch (error) {
            console.error(chalk_1.default.red.bold(`Failed to generate commit message with ${chalk_1.default.bold(provider)}.`));
            console.error(chalk_1.default.red('Make sure the AI tool is installed and accessible.'));
            console.error(chalk_1.default.gray.dim('Error details:'), chalk_1.default.gray(error.message));
            commitMessage = '';
        }
        try {
            fs.unlinkSync(diffPath);
        }
        catch (error) {
        }
        if (!commitMessage) {
            console.log(chalk_1.default.yellow.bold('Failed to generate commit message. Using default message.'));
            commitMessage = 'Update files';
        }
        console.log(chalk_1.default.green.bold('Commit message:'), chalk_1.default.green(commitMessage));
        if (!diffFile && !noCommit) {
            runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
            console.log(chalk_1.default.blue.bold('Changes committed successfully.'));
        }
        else if (noCommit) {
            console.log(chalk_1.default.blue.bold('Note: No commit was made (dry run mode).'));
        }
        else {
            console.log(chalk_1.default.blue.bold('Note: No commit was made as a diff file was provided.'));
        }
        const endTime = Date.now();
        const duration = endTime - startTime;
        const durationInSeconds = (duration / 1000).toFixed(2);
        console.log(chalk_1.default.green.bold(`Successfully processed in ${chalk_1.default.blue.bold(durationInSeconds)} seconds.`));
        return true;
    }
    catch (error) {
        console.error(chalk_1.default.red.bold('Error:'), chalk_1.default.red(error.message));
        throw error;
    }
}
exports.commit = commit;
const program = new commander_1.Command();
program
    .name('git-commit-m')
    .description(chalk_1.default.blue('CLI tool that automatically generates commit messages using AI and commits changes'))
    .option('-n, --no-add-dot', chalk_1.default.yellow('skip the "git add ." step'))
    .option('-p, --prompt-arg <arg>', chalk_1.default.yellow('specify the prompt argument to pass to the AI tool'), '-p')
    .option('--provider <provider>', chalk_1.default.yellow('specify the AI provider to use (gemini, qwen, claude, codex, continue, or any string)'), 'gemini')
    .option('--diff <file>', chalk_1.default.yellow('specify a diff file to use instead of generating one from git'))
    .option('--no-commit', chalk_1.default.yellow('dry run mode - generate commit message without committing'))
    .action(async (options) => {
    try {
        await commit(options);
    }
    catch (error) {
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=commit.js.map