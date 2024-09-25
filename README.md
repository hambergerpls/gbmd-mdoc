# gbmd-mdoc
CLI tool to convert synced [Gitbook's](https://gitbook.com) markdown syntax to [Markdoc's](https://markdoc.dev)

## Purpose
The reason why this tool exists is because I want integrate Gitbook with Astro. Unfortunately, based on Astro's documentation on [migrate Gitbook with Astro](https://docs.astro.build/en/guides/migrate-to-astro/from-gitbook/), it only shows on how to export markdowns from Gitbook to Astro's content directory and need to manually convert Gitbook's syntax to Markdoc. Which also implies completely migrating away from Gitbook and use Astro for writing content.

## Problems
- Non-technical writers may not want to write in Markdown and prefer Gitbook UI to write their content
- We don't want manual labour to convert Gitbook syntax to Markdoc
- We want to integrate Gitbook sync with Astro

## Implementation
The current implementation is not that great. I created this tool in 1 day, so I might have missed some edge cases. I would actually prefer to be able to parse Gitbook markdown AST, then do the conversion from there instead of string replacing tags. I can't find a library from Gitbook's repository on how they parse their Markdown files, else I would have use it for the implementation. For now, converting some samples from Gitbook templates works.

## Contribution
Feel free to contribute some improvements on the implementation by creating a PR.

## [License (MIT)](LICENSE)
