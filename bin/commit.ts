#!/usr/bin/env node

import { Command } from 'commander'
import { execSync, ExecSyncOptions } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

interface RunCommandOptions extends ExecSyncOptions {
  ignoreErrors?: boolean
}

function runCommand(command: string, options: RunCommandOptions = {}): string {
  try {
    const result = execSync(command, { encoding: 'utf-8', stdio: 'pipe', ...options })
    return result as string
  } catch (error: any) {
    if (options.ignoreErrors) {
      return error.stdout || ''
    }
    throw error
  }
}

/**
 * Generates a commit message using AI and commits changes
 * @param options - Configuration options
 * @returns Promise that resolves to true if successful
 */
export async function commit(options: {
  noAddDot?: boolean
  promptArg?: string
  provider?: string
  diff?: string
  noCommit?: boolean
  noSignature?: boolean
}): Promise<boolean> {
  const noAddDot = options.noAddDot || false
  const promptArg = options.promptArg || '-p'
  const provider = options.provider || 'gemini'
  const diffFile = options.diff
  const noCommit = options.noCommit || false
  const noSignature = options.noSignature || false

  // Start timing
  const startTime = Date.now()

  try {
    // Add all changes to git if not skipped and no diff file provided
    if (!noAddDot && !diffFile) {
      console.log(chalk.blue.bold('Adding all changes to git...'))
      runCommand('git add .')
    }

    let diff = ''
    if (diffFile) {
      // Read diff from provided file
      console.log(chalk.blue.bold(`Reading diff from file: ${chalk.green.bold(diffFile)}...`))
      diff = fs.readFileSync(diffFile, 'utf-8')
    } else {
      // Create diff of staged changes
      diff = runCommand('git diff --cached', { ignoreErrors: true })
    }

    // Check if there are changes
    if (!diff.trim()) {
      console.log(chalk.yellow.bold('No changes to commit.'))
      process.exit(1)
    }

    // Write diff to file in current working directory
    const diffPath = path.join(process.cwd(), 'git_diff.txt')

    // Prepend prompt to diff
    const prompt = 'Summarize this git diff into a clear commit message:'
    fs.writeFileSync(diffPath, `${prompt}\n${diff}`)

    // Try to generate commit message with AI
    let commitMessage = ''
    try {
      console.log(chalk.blue.bold(`Generating commit message with ${chalk.green.bold(provider)}...`))
      // Use the specified provider with the prompt argument
      commitMessage = runCommand(`${provider} ${promptArg} "@${diffPath}"`, { ignoreErrors: true }).trim()
    } catch (error: any) {
      // If the primary provider fails, show an error message
      console.error(chalk.red.bold(`Failed to generate commit message with ${chalk.bold(provider)}.`))
      console.error(chalk.red('Make sure the AI tool is installed and accessible.'))
      console.error(chalk.gray.dim('Error details:'), chalk.gray(error.message))
      commitMessage = ''
    }

    // Clean up diff file
    try {
      fs.unlinkSync(diffPath)
    } catch (error) {
      // Ignore cleanup errors
    }

    // Check if we got a commit message
    if (!commitMessage) {
      console.log(chalk.red.bold('Failed to generate commit message.'))
      console.log(chalk.red('Please make sure:'))
      console.log(chalk.red('  - The AI provider (codex, gemini, etc.) is installed'))
      console.log(chalk.red('  - You have network connectivity'))
      console.log(chalk.red('  - Your API keys are properly configured or authentication is set up properly'))
      console.log(chalk.red('  - The AI provider is working correctly (test by typing e.g. "gemini" in the console)'))
      console.log(chalk.red.bold('Exiting without committing changes.'))
      process.exit(1)
    }

    // Add signature if not disabled
    if (!noSignature) {
      commitMessage += '\n\nGenerated using @missb/git-commit-m'
    }

    console.log(chalk.green.bold('Commit message:'), chalk.green(commitMessage))

    // Commit with the message (only if no diff file was provided and not in dry run mode)
    if (!diffFile && !noCommit) {
      runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`)
      console.log(chalk.blue.bold('Changes committed successfully.'))
    } else if (noCommit) {
      console.log(chalk.blue.bold('Note: No commit was made (dry run mode).'))
    } else {
      console.log(chalk.blue.bold('Note: No commit was made as a diff file was provided.'))
    }

    // Calculate and display execution time
    const endTime = Date.now()
    const duration = endTime - startTime
    const durationInSeconds = (duration / 1000).toFixed(2)

    console.log(chalk.green.bold(`Successfully processed in ${chalk.blue.bold(durationInSeconds)} seconds.`))
    return true
  } catch (error: any) {
    console.error(chalk.red.bold('Error:'), chalk.red(error.message))
    throw error
  }
}

// CLI setup
const program = new Command()

program
  .name('git-commit-m')
  .description(chalk.blue('CLI tool that automatically generates commit messages using AI and commits changes'))
  .option('-n, --no-add-dot', chalk.yellow('skip the "git add ." step'))
  .option('-p, --prompt-arg <arg>', chalk.yellow('specify the prompt argument to pass to the AI tool'), '-p')
  .option('--provider <provider>', chalk.yellow('specify the AI provider to use (gemini, qwen, claude, codex, continue, or any string)'), 'gemini')
  .option('--diff <file>', chalk.yellow('specify a diff file to use instead of generating one from git'))
  .option('--no-commit', chalk.yellow('dry run mode - generate commit message without committing'))
  .option('--no-signature', chalk.yellow('disable adding signature to commit message'))
  .action(async (options) => {
    try {
      await commit(options)
    } catch (error) {
      process.exit(1)
    }
  })

program.parse()