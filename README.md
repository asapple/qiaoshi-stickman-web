# Qiaoshi Stickman Web

A Vue 3-based web application for managing smart devices with real-time video streaming and advanced privacy features.

[中文版本](README.zh-CN.md) | [English Version](README.md)

## Features

- Device management dashboard with status indicators
- Device detail view with:
  - Real-time video player
  - Privacy controls (Stickman Mode and Portrait Anonymization)
  - Password modification
  - Notification recipient management
  - Exception event image gallery with lightbox preview
- Responsive design for both desktop and mobile devices
- Modern UI with Vant components

## Tech Stack

- [Vue 3](https://v3.vuejs.org/) with Composition API
- [Vant](https://vant-ui.github.io/vant/#/en-US) - Mobile UI components
- [Vue Router](https://router.vuejs.org/) for navigation
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vite](https://vitejs.dev/) for build tooling
- [TypeScript](https://www.typescriptlang.org/) for type safety

## Project Setup

### Prerequisites

- Node.js (version specified in package.json)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd qiaoshi-stickman-web

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run end-to-end tests
npm run test:e2e
```

### Linting and Formatting

```bash
# Lint the codebase
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
├── composables/      # Vue composables
├── router/           # Vue Router configuration
├── stores/           # Pinia stores
├── utils/            # Utility functions
├── views/            # Page components
├── App.vue           # Root component
└── main.ts           # Application entry point
```

## Key Components

### Device Management (`DeviceView.vue`)

- Displays a grid of connected devices
- Shows device status (online/offline/maintenance)
- Allows adding new devices

### Device Detail (`DeviceDetailView.vue`)

- Real-time video player component
- Privacy controls:
  - Stickman Mode: Replaces people with stick figures
  - Portrait Anonymization: Blurs faces
- Password management
- Notification recipient management
- Exception event image gallery

### Video Player (`VideoPlayer.vue`)

- Responsive video player with 16:9 aspect ratio
- Placeholder with animation when no stream is available

## Routing

- `/login` - Login page
- `/device` - Device management dashboard
- `/device/:id` - Device detail page
- `/profile` - User profile page

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## CI/CD Deployment

This project uses GitHub Actions for continuous integration and deployment with two separate workflows:

### Test and Lint Workflow (test-and-lint.yml)

Located at `.github/workflows/test-and-lint.yml`, this workflow runs on every push to branches other than `main` and `gh-pages`:
- Checks out the code
- Sets up Node.js environment
- Installs dependencies
- Runs linter to check code quality
- Runs type checking
- Builds the project

This workflow ensures that all code changes pass quality checks before merging.

### Deployment Workflow (deploy.yml)

Located at `.github/workflows/deploy.yml`, this workflow runs on pushes to `main` and `gh-pages` branches:
- Checks out the code
- Sets up Node.js environment
- Installs dependencies
- Builds the project for GitHub Pages
- Deploys the built files to GitHub Pages using the `PAT` secret

### Setup for GitHub Pages Deployment

1. Generate a Personal Access Token (PAT) with `repo` permissions:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Generate a new token with `repo` scope
   - Copy the token

2. Add the PAT as a secret in your repository:
   - Go to your repository Settings > Secrets and variables > Actions
   - Create a new repository secret named `PAT`
   - Paste your Personal Access Token as the value

3. The deployment workflow will automatically run on pushes to the `main` branch.

### Deployment Process

1. Every push to the `main` branch triggers the deployment workflow
2. The workflow builds the application and deploys it to GitHub Pages
3. Deployment status can be viewed in the Actions tab of the repository

### Manual Deployment

To manually trigger a deployment:

1. Go to the repository's Actions tab
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" and select the branch to deploy from

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vant UI](https://github.com/youzan/vant) for mobile UI components
- [Vue.js](https://github.com/vuejs/vue) for the progressive framework
- [Vite](https://github.com/vitejs/vite) for fast build tooling