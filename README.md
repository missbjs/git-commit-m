# git-commit-m

A CLI tool that automatically generates commit messages using AI and commits changes.

## Installation

```bash
npm install -g git-commit-m
```

Or install with pnpm:

```bash
pnpm install -g git-commit-m
```

Or install with yarn:

```bash
yarn global add git-commit-m
```

Or use directly with npx:

```bash
npx git-commit-m
```

## Usage

### git-commit-m

Automatically generates commit messages using AI and commits changes:

```bash
git-commit-m
```

This command will:
1. Stage all changes (`git add .`)
2. Generate a diff of staged changes
3. Use an AI model to create a meaningful commit message
4. Commit with the generated message
5. Display the time taken for the entire process

### Sample Output

```bash
$ git-commit-m

Adding all changes to git...
Generating commit message with gemini...
Commit message: feat: Change package name to `@missb/git-commit-m`

The package name has been updated to `@missb/git-commit-m` in `package.json` and all corresponding references in the `README.md` have been changed from `git-commit--message` to `git-commit-m`.
Changes committed successfully.
Successfully processed in 14.19 seconds.
```

### Options

```bash
Usage: git-commit-m [options]

CLI tool that automatically generates commit messages using AI and commits changes

Options:
  -n, --no-add-dot              skip the "git add ." step
  -p, --prompt-arg <arg>        specify the prompt argument to pass to the AI tool (default: "-p")
  --provider <provider>         specify the AI provider to use (gemini, qwen, claude, codex, continue, or any string) (default: "gemini")
  --diff <file>                 specify a diff file to use instead of generating one from git
  --no-commit                   dry run mode - generate commit message without committing
  -h, --help                    display help for command
```

### Examples

```bash
# Normal usage (uses gemini as default provider)
git-commit-m

# Skip git add . step
git-commit-m --no-add-dot
# or
git-commit-m -n

# Use a custom prompt argument
git-commit-m --prompt-arg "--prompt"
# or
git-commit-m -p "--prompt"

# Use a different AI provider
git-commit-m --provider qwen
git-commit-m --provider claude
git-commit-m --provider codex

# Use a specific diff file instead of generating one from git
git-commit-m --diff path/to/diff.txt

# Dry run mode - generate commit message without committing
git-commit-m --no-commit

# Combine multiple options
git-commit-m --no-add-dot --prompt-arg "--prompt" --provider qwen --no-commit
```

Supported providers:
- `gemini` (default)
- `qwen`
- `claude`
- `codex`
- `cn (continue)`
- Any other string (will attempt to execute as a command)

Requires one of the following AI tools to be installed:
- `gemini` (primary)
- Other AI commit tools (fallback)

If no AI tool is available, it will fall back to a generic "Update files" message.

## How it works

1. Adds all changes to git staging area (unless `--no-add-dot` is specified)
2. Creates a diff of the staged changes (or uses provided diff file with `--diff`)
3. Uses AI to generate a meaningful commit message based on the diff
4. Commits the changes with the generated message (unless `--diff` or `--no-commit` is used)
5. Displays the time taken for the entire process

## Requirements

- Node.js >= 12
- Git
- An AI tool (like `gemini`) for generating commit messages

## Development

This project is written in TypeScript with a modular structure:
- `bin/commit.ts` - Main CLI implementation
- `index.ts` - Programmatic API entry point

To build:

```bash
npm run build
```

## License

MIT