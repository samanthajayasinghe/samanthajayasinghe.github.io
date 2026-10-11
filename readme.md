# samanthajayasinghe.github.io

Personal site for Samantha Jayasinghe, built with [Hugo](https://gohugo.io/) and
the [Ananke](https://github.com/theNewDynamic/gohugo-theme-ananke) theme, and
deployed to GitHub Pages via GitHub Actions.

## Structure

- `config.toml` — site configuration (title, base URL, params, social links).
- `content/en/` — site content.
  - `_index.md` — home page.
  - `about/index.md` — about page.
  - `post/` — blog posts (one Markdown file per post).
- `themes/ananke/` — the theme (git submodule).
- `.github/workflows/hugo.yaml` — builds with Hugo and deploys to Pages on push
  to `main`.

## Writing a new post

Add a Markdown file under `content/en/post/`, for example:

```md
---
title: "My new post"
date: 2026-10-11
description: "A one-line summary."
tags: ["sre"]
---

Post body here.
```

Commit and push to `main`; the workflow builds and deploys automatically.

## Local preview

Requires the Hugo extended binary:

```sh
hugo server -D
```
