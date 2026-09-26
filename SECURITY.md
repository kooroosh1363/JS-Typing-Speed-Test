# Security Policy

TypeBench is a static, client-side portfolio project. It has no backend service, authentication system, database, API keys, payment flow, or server-side data processing.

## Supported version

Security fixes are applied to the current `main` branch only.

## Reporting a vulnerability

If you find a security issue in the maintained source, open a GitHub issue with enough detail to reproduce the problem. Do not include secrets, personal data, or exploit payloads against third-party systems.

## Scope

Relevant examples include:

- unsafe DOM injection introduced by project code
- unexpected execution of untrusted content
- sensitive browser data being persisted unintentionally
- dependency or workflow changes that create a practical repository risk

General browser vulnerabilities, GitHub platform issues, and attacks that require modifying the page through developer tools are outside this project's scope.
