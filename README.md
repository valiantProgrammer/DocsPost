<div align="center">

<img src="./docs/assets/banner.svg" alt="DocsPost — Share knowledge, Build the future" width="100%"/>

<br/>

# [DocsPost](https://docs-post-two.vercel.app/)

**A modern knowledge platform for developers, students, and technical creators.**

[![readme-typing-svg](https://readme-typing-svg.demolab.com?font=Geist+Mono&size=16&pause=1200&color=3B82F6&center=true&vCenter=true&multiline=false&width=500&lines=Write+and+publish+technical+documentation;Explore+curated+engineering+roadmaps;Track+your+content+analytics+in+real+time;Discover+what+you+need+to+grow)](https://git.io/typing-svg)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-5.x-F03E2F?style=flat-square&logo=sanity&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/github/license/valiantProgrammer/DocsPost?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/valiantProgrammer/DocsPost?style=flat-square)
[![GitHub Stars](https://img.shields.io/github/stars/valiantProgrammer/DocsPost?style=flat-square&logo=github)](https://github.com/valiantProgrammer/DocsPost/stargazers)

<br/>

**[Features](#-features) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Roadmap](#-roadmap) · [Contributing](#-contributing)**

<!-- TODO: Add your live demo URL, then uncomment the badge below -->
<!-- [![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-2563eb?style=flat-square&logo=vercel)](https://your-deployment-url.vercel.app) -->

</div>

---

## About

DocsPost is a full-stack knowledge-sharing platform aimed at developers, students, and technical creators. Users write and publish documentation, tutorials, and engineering roadmaps, then track their content's performance through a built-in analytics dashboard. It sits somewhere between a personal wiki and a dev-focused publishing platform — structured enough for serious technical writing, open enough for quick guides and notes.
<img src="./docs/assets/divider.svg" alt="" width="50%"/>

## Features

<table>
<tr>
<td width="33%">

📝 **Rich Document Editor**<br/>
Tiptap-powered editor with Markdown, code blocks (Monaco + highlight.js), tables, task lists, and image uploads.

</td>
<td width="33%">

🗂️ **Personal Workspace**<br/>
Draft, publish, bookmark, share, and trash documents from a sidebar-driven workspace.

</td>
<td width="33%">

📊 **Content Analytics**<br/>
Per-document views, upvotes, engagement rate, contribution heatmap, and sliding-window charts (Recharts).

</td>
</tr>
<tr>
<td width="33%">

🎓 **Learning Tracks**<br/>
Follow curated engineering roadmaps (System Design, Full Stack, DevOps) and track module-level progress.

</td>
<td width="33%">

🔍 **Explore & Search**<br/>
Full-text search across docs and categories (Backend, Frontend, AI & ML, System Design, and more).

</td>
<td width="33%">

👤 **Profiles & Social**<br/>
Public author profiles with follow, message, and per-user document feeds; Cloudinary avatar uploads.

</td>
</tr>
</table>

<details>
<summary>More details</summary>

- **Auth**: Custom Google OAuth 2.0 flow with JWT cookies (`docspost-username`), protected by Next.js middleware.
- **CMS**: Sanity v5 Studio (embedded at `/studio`) manages articles, authors, and categories with a structured schema.
- **Notifications**: In-app notification bell with real-time badge counts.
- **Themes**: System-aware light / dark toggle persisted across sessions.
- **Storage quota**: Per-user storage display (e.g., 2.4 GB / 10 GB) shown in sidebar.
- **Settings**: Full profile settings page — name, bio, location, banner image, social links, and profile picture.

</details>

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Screenshots

### Homepage

<table>
<tr>
<th>Dark mode</th>
<th>Light mode</th>
</tr>
<tr>
<td>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/screenshots/home-dark.png"/>
    <img src="./docs/assets/screenshots/home-light.png" alt="DocsPost homepage light" width="100%"/>
  </picture>
</td>
<td>
  <img src="./docs/assets/screenshots/home-light.png" alt="DocsPost homepage light" width="100%"/>
</td>
</tr>
</table>

### Explore & Categories

<table>
<tr>
<td width="50%">
  <img src="./docs/assets/screenshots/explore-page.png" alt="Explore page" width="100%"/>
  <p align="center"><sub>Explore — filterable feed by topic and type</sub></p>
</td>
<td width="50%">
  <img src="./docs/assets/screenshots/categories-page.png" alt="Categories page" width="100%"/>
  <p align="center"><sub>Categories — organised engineering domains</sub></p>
</td>
</tr>
</table>

### Dashboard & Analytics

<table>
<tr>
<td width="50%">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/screenshots/dashboard-overview-dark.png"/>
    <img src="./docs/assets/screenshots/dashboard-overview-light.png" alt="Dashboard overview" width="100%"/>
  </picture>
  <p align="center"><sub>Dashboard overview with stats and performance chart</sub></p>
</td>
<td width="50%">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/screenshots/analytics-dark.png"/>
    <img src="./docs/assets/screenshots/analytics-light.png" alt="Analytics page" width="100%"/>
  </picture>
  <p align="center"><sub>Analytics — views over time and contribution heatmap</sub></p>
</td>
</tr>
</table>

### Learning & Profile

<table>
<tr>
<td width="50%">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/screenshots/learning-dark.png"/>
    <img src="./docs/assets/screenshots/learning-light.png" alt="Learning tracks" width="100%"/>
  </picture>
  <p align="center"><sub>Learning tracks with module progress</sub></p>
</td>
<td width="50%">
  <img src="./docs/assets/screenshots/profile-page-dark.png" alt="User profile" width="100%"/>
  <p align="center"><sub>Public profile — followers, documents, and analytics tabs</sub></p>
</td>
</tr>
</table>

> **Hero demo** — <!-- TODO: Record an 8-12 s walkthrough GIF and drop it at `./docs/assets/hero-demo.gif` then uncomment: -->
> <!-- `![DocsPost demo](./docs/assets/hero-demo.gif)` -->

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16.2, React 19, Tailwind CSS 4, Framer Motion 12 |
| **Editor** | Tiptap 3, Monaco Editor 4.7, highlight.js 11, Shiki 4 |
| **Backend** | Next.js API Routes, Node.js, Nodemailer 8 |
| **Database** | MongoDB 7 (native driver) |
| **Auth** | Google OAuth 2.0, JSON Web Tokens, cookie-based sessions |
| **CMS** | Sanity v5 (embedded Studio at `/studio`) |
| **Media** | Cloudinary SDK v2 |
| **Charts** | Recharts 3 |
| **Testing** | Vitest 5, happy-dom |
| **Tooling** | ESLint 9, PostCSS, cmdk |

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Architecture

```mermaid
flowchart TD
    Browser["Browser (React 19)"]

    subgraph "Next.js 16 App Router"
        MW["Middleware\n(cookie auth guard)"]
        Pages["Pages & Layouts\n/app"]
        API["API Routes\n/app/api"]
    end

    subgraph "Data Layer"
        Mongo["MongoDB 7\n(users, docs, analytics)"]
        Sanity["Sanity v5\n(articles, authors, categories)"]
        Cloud["Cloudinary\n(avatars, images)"]
    end

    subgraph "Auth"
        Google["Google OAuth 2.0"]
        JWT["JWT Cookie\ndocspost-username"]
    end

    Browser --> MW
    MW --> Pages
    Pages --> API
    API --> Mongo
    API --> Sanity
    API --> Cloud
    API --> Google
    Google --> JWT
    JWT --> MW
```

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (Next.js 16 requirement)
- **npm** ≥ 9
- A [MongoDB Atlas](https://mongodb.com/atlas) cluster (or local MongoDB)
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials
- A [Cloudinary](https://cloudinary.com) account
- A [Sanity](https://sanity.io) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/valiantProgrammer/DocsPost.git
cd DocsPost

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

<details>
<summary>Click to expand — <code>.env.local</code> reference</summary>

> [!WARNING]
> Never commit `.env.local`. It is already listed in `.gitignore`.

| Variable | Purpose | Example placeholder |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:3000/api/auth/google/callback` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/docspost` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefgh...` |
| `SANITY_PROJECT_ID` | Sanity project ID | `abc123de` |
| `SANITY_DATASET` | Sanity dataset | `production` |

</details>

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (`next dev`) |
| `npm run build` | Build for production (`next build`) |
| `npm run start` | Start production server (`next start`) |
| `npm run lint` | Lint the codebase (`eslint`) |
| `npm run test` | Run unit tests (`vitest run`) |

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Project Structure

<details>
<summary>Top two levels</summary>

```
DocsPost/
├── app/                        # Next.js App Router
│   ├── Auth/                   # Login / OAuth callback pages
│   ├── [username]/             # Public user profile route
│   ├── analytics/              # Analytics page
│   ├── api/                    # API route handlers
│   │   ├── auth/               # Google OAuth endpoints
│   │   ├── docs/               # Document CRUD
│   │   ├── analytics/          # Analytics endpoints
│   │   ├── profile/            # Profile update
│   │   └── upload/             # Cloudinary upload
│   ├── bookmarks/              # Bookmarks page
│   ├── categories/             # Category browser
│   ├── components/             # Shared React components
│   ├── dashboard/              # Dashboard (overview, sidebar)
│   ├── doc/                    # Single document view
│   ├── drafts/                 # Draft documents list
│   ├── explore/                # Explore / search feed
│   ├── learning/               # Learning tracks & roadmaps
│   ├── new/                    # New document creation
│   ├── notifications/          # Notification centre
│   ├── post/                   # Post-creation flow
│   ├── profile/                # Profile redirect (middleware)
│   ├── providers/              # Context providers (theme, auth)
│   ├── published/              # Published documents list
│   ├── search/                 # Search results
│   ├── settings/               # Account settings
│   ├── shared/                 # Shared documents list
│   ├── studio/                 # Embedded Sanity Studio
│   ├── trash/                  # Trash / recycle bin
│   ├── workspace/              # Workspace overview
│   ├── globals.css             # Global styles
│   └── layout.js               # Root layout (metadata, fonts)
├── components/                 # Root-level shared components
├── lib/                        # Utility modules
│   ├── auth.js                 # Auth helpers
│   ├── db.js                   # MongoDB connection
│   ├── markdown.js             # Markdown parsing
│   ├── session.js              # Session helpers
│   └── shikiTheme.js           # Shiki code theme
├── sanity/                     # Sanity CMS configuration
│   └── schemaTypes/            # article, author, category, document schemas
├── docs/assets/                # README assets (SVGs, screenshots)
├── public/                     # Static public files
├── scripts/                    # Build scripts (copy-monaco)
├── test/                       # Vitest test files
├── middleware.js               # Route protection
└── next.config.mjs             # Next.js config
```

</details>

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Roadmap

- [x] Google OAuth authentication
- [x] Rich text editor (Tiptap) with code blocks and syntax highlighting
- [x] MongoDB document storage (CRUD)
- [x] Sanity CMS integration
- [x] Dashboard overview with stats
- [x] Content analytics with sliding-window charts
- [x] Learning tracks and engineering roadmaps
- [x] Explore and search feed with topic/type filters
- [x] Public author profiles with follow/unfollow
- [x] Cloudinary avatar and banner uploads
- [x] Light / dark theme toggle
- [x] Notification system
- [x] Contribution activity heatmap
- [ ] <!-- TODO --> Real-time notifications (WebSocket or SSE)
- [ ] <!-- TODO --> Collaborative editing
- [ ] <!-- TODO --> Comment threads on documents
- [ ] <!-- TODO --> Email digest (weekly top docs)
- [ ] <!-- TODO --> Public API / embed widget
- [ ] <!-- TODO --> Mobile-responsive polish pass

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes and add or update tests in `test/`.
3. Run `npm run lint && npm run test` before pushing.
4. Open a pull request with a clear description of what changed and why.
5. One approval from a maintainer is required to merge.

<img src="./docs/assets/divider.svg" alt="" width="100%"/>

## License

<!-- TODO: Add a LICENSE file to the repo root. The project does not currently ship one. -->
This project is unlicensed. Contact the author for usage permissions.

<br/>

<div align="center">

<img src="./docs/assets/status-dot.svg" alt="Live" width="70"/>

*Built with Next.js 16 · React 19 · MongoDB · Sanity · Cloudinary*

[![GitHub](https://img.shields.io/badge/valiantProgrammer-DocsPost-181717?style=flat-square&logo=github)](https://github.com/valiantProgrammer/DocsPost)

</div>