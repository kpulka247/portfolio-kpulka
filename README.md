<div align="center">

# Portfolio

<a href="https://github.com/kpulka247/portfolio-kpulka/actions" title="GitHub Actions Workflow Status"><img src="https://img.shields.io/github/actions/workflow/status/kpulka247/portfolio-kpulka/release.yml"></a>
<a href="https://github.com/kpulka247/portfolio-kpulka/releases" title="GitHub Release"><img src="https://img.shields.io/github/v/release/kpulka247/portfolio-kpulka?logo=github&logoColor=white"></a>

**[Website](https://www.kpulka.com)**

</div>

This repository contains the source code for my personal portfolio website, designed to showcase my skills and projects. It was built from scratch with a modern tech stack to be fast, responsive, and maintainable, following professional development practices.

## Tech Stack

<div align="center">

<a href="https://reactjs.org/" title="React"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"></a>
<a href="https://vitejs.dev/" title="Vite"><img src="https://img.shields.io/badge/Vite-9B5FFE?style=for-the-badge&logo=vite&logoColor=white"></a>
<a href="https://www.typescriptlang.org/" title="TypeScript"><img src="https://img.shields.io/badge/TypeScript-323332?style=for-the-badge&logo=typescript&logoColor=007ACC"></a>
<a href="https://tailwindcss.com/" title="Tailwind CSS"><img src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white"></a>
<a href="https://git-scm.com/" title="Git"><img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"></a>

</div>

## How to Run Locally

Make sure you have:

- [Node.js](https://nodejs.org) (LTS version recommended) installed on your system
- [Git](https://git-scm.com/) for version control

Then install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

 The site will be available at `http://localhost:5173`.

## Automation & Versioning (CI/CD)

This project is configured with a robust CI/CD pipeline using GitHub Actions to ensure code quality and automate the release process.

### 🚀 Automated Deployment

Every push to the `main` branch automatically triggers a workflow that builds and deploys the latest version of the site to GitHub Pages. This ensures the live website is always synchronized with the code. The pipeline is split into `build` and `deploy` jobs for maximum security and reliability.

### 🏷️ Automated Versioning with Semantic Release

In addition to deployments, this project uses [semantic-release](https://github.com/semantic-release/semantic-release) and [Conventional Commits](https://www.conventionalcommits.org/) for automated version management.

Based on the commit messages (e.g., `feat: ...`, `fix: ...`, `BREAKING CHANGE: ...`), the CI/CD pipeline automatically:
-   Determines the correct semantic version bump (patch, minor, or major)
-   Generates and updates a `CHANGELOG.md` file
-   Creates a tagged GitHub Release with comprehensive release notes

## Changelog

Changes for each release are automatically documented in the [CHANGELOG.md](./CHANGELOG.md) file.