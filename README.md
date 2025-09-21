<div align="center">

## Portfolio - kpulka247

<a href="https://github.com/kpulka247/kpulka-website/actions" title="GitHub Actions Workflow Status"><img src="https://img.shields.io/github/actions/workflow/status/kpulka247/kpulka-website/release.yml"></a>
<a href="https://github.com/kpulka247/kpulka-website/releases" title="GitHub Release"><img src="https://img.shields.io/github/v/release/kpulka247/kpulka-website?logo=github&logoColor=white"></a>

**[Website](https://www.kpulka.com)**

</div>

This repository contains the source code for my personal portfolio website, designed to showcase my skills and projects. It was built from scratch with a modern tech stack to be fast, responsive, and maintainable, following professional development practices.

## Tech Stack

A brief overview of the main technologies used in this project:

-   **Framework:** [React](https://reactjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Deployment:** [GitHub Pages](https://docs.github.com/pages)
-   **Automation:** [GitHub Actions](https://docs.github.com/actions) + [semantic-release](https://github.com/semantic-release/semantic-release)

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