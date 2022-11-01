# Arcio Authentication

This repo is to setup the authentication for the arcio systems.

[![ci](https://github.com/arcio-uk/auth-system/actions/workflows/main-merging.yml/badge.svg)](https://github.com/arcio-uk/auth-system/actions/workflows/main-merging.yml)
![Statements](https://img.shields.io/badge/statements-91.73%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-78.37%25-red.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-87.8%25-yellow.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-90.77%25-brightgreen.svg?style=flat)

## Getting Started

```
npm install
npm run dev
```

The public/private key paths are relative to the root of the project. If you want to add them outside the project do: ../

## .env content
```yml
DATABASE_URL=postgresql://user:password@www.url.com:port/db_name
JWT_SECRET=SharedSecretWithBackend
LOG_DIR=./directory_to_store_logs/
ROTATING_LOG_FILE_NAME=auth-%DATE%.log
AUDIT_FILE_NAME=auditFile.json
LOG_EXPIRY_TIME=365d
PORT=5000
PRIVATE_KEY=path/to/private
PUBLIC_KEY=path/to/public
```

## Commit rules

Husky is setup to inforce commit rules through CommitLint

You must write your commits in the following format:

	type(scope?): subject 

types:
- ci (Changes to the CI configuration files and scripts)
- chore (Other changes that don't modify src or test files)
- docs (Changes to documentation files)
-	feat (A new feature that has been added)
-	fix (A fix that has been made)
-	perf (A change relating to performance)
-	refactor (A code change that neither fixes a bug nor adds a feature)
-	revert (Reverting a previous commit/change)
-	style (A change that is relating to code style)
- test (Any new tests or adjustments to them)

examples:

	chore: enabled commit linting
	ci(app.ts): commiting progress on express server

[Click here to find out more](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)
