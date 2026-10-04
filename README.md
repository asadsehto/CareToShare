# CareToShare

**A full-stack platform for students to share and discover study materials.**

CareToShare combines a React interface with an Express API and MongoDB. Google OAuth provides sign-in, while files are stored in each user’s own Google Drive rather than a central file server.

[Web app](https://caretshare.netlify.app/) · [Author](https://github.com/asadsehto)

## Features

- Google sign-in and user profiles.
- Uploads and category-based browsing across seven file types.
- Search over file metadata and users.
- Download and view instrumentation.
- Responsive interface with React, Tailwind CSS, and Framer Motion.

## Architecture

```text
React client → Express API → MongoDB metadata
                    ↓
            User-owned Google Drive files
```

| Path | Purpose |
| --- | --- |
| `client/` | React web client |
| `server/` | Express API, authentication, and file-sharing backend |
| `mobile/` | Mobile-related source |
| `render.yaml` | Deployment configuration |

## Development

Requirements: Node.js, MongoDB (local or Atlas), and a Google Cloud project with OAuth credentials and the Google Drive API enabled.

```bash
git clone https://github.com/asadsehto/CareToShare.git
cd CareToShare
npm run install:all
```

Create `client/.env`:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Create `server/.env`:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/caretoshare
JWT_SECRET=replace-with-a-strong-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Configure the Google OAuth consent screen and match allowed origins/redirects to the application’s implemented flow. The existing setup uses user-info and Drive file scopes; confirm the client/server URLs against your configuration. Keep environment files out of Git.

Start MongoDB if using a local database, then run:

```bash
npm run dev
```

The project’s development instructions use client port **3000** and server port **5000**. You can also run each service separately with `npm run dev` in `client/` and `server/`.

## API overview

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/google/token` |
| File lists | `GET /api/files/recent`, `/popular`, `/category`, `/my-files` |
| File operations | `GET /api/files/:id`, `POST /api/files/upload`, `POST /api/files/:id/download`, `DELETE /api/files/:id` |
| Profiles | `PUT /api/users/profile`, `GET /api/users/:id` |
| Search | `GET /api/search?q=query` |
| Statistics | `GET /api/stats` |

## Deployment

Build the client with `npm run build` in `client/`, deploy its `dist/` output, and configure `VITE_GOOGLE_CLIENT_ID`. Deploy the server with its MongoDB, JWT, and Google environment variables. Update OAuth origins and redirects for the deployed application.

## Usage

1. Sign in with Google.
2. Upload study material and its metadata.
3. Browse categories or search.
4. View uploader profiles and download available materials.

## Contributing

Issues and pull requests are welcome. For authentication or upload bugs, include reproduction steps without credentials or private files.

## Author

[Asad Saleem](https://github.com/asadsehto) · [LinkedIn](https://www.linkedin.com/in/asadsaleemsahto/)
