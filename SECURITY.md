# Security Policy

## Supported versions

The live TaCL website and the current `main` branch are supported. Older forks,
archived deployments, and local edits are not actively monitored by the TaCL
maintainers.

## Reporting a vulnerability

Please report security issues privately instead of opening a public issue.

Use one of these channels:

- Email Rexzy at `rexzy62@proton.me`
- Contact the list staff through the Discord linked on the website

Include as much detail as you can:

- A short summary of the issue
- Steps to reproduce it
- The affected page, file, or data entry
- Browser and device information when the issue is frontend-related
- Screenshots or proof of concept details, if useful

## What to expect

We aim to acknowledge reports within 72 hours. Fix timing depends on severity,
reproducibility, and whether the issue affects the live site, list data, or only
local development.

When a report is accepted, we will work on a fix privately and publish the
change once it is ready. Credit can be included if the reporter wants it.

## Scope

Security issues in scope include:

- Cross-site scripting or unsafe HTML/script injection
- Unsafe external links or embeds
- Data validation gaps that can break the live site
- Exposure of private maintainer or contributor information
- GitHub Actions workflow issues that could affect the repository

Out of scope:

- Spam, duplicate reports, or social engineering
- Issues that require access to someone else's private account
- Problems caused only by modified local copies of the site
- Reports without enough information to reproduce the issue
