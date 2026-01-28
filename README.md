# Asset Frontend App

A modern, responsive financial asset management dashboard built with React, TypeScript, and Vite. This application provides tools for tracking deposits, calculating recurring expenses, and visualizing financial data.

## Features

-   **Dashboard Overview**: Visualize income, expenses, and net assets.
-   **Deposit Management**: Track daily transactions with detailed list, inline, and chart views.
-   **Calculation**: Manage recurring payments/earnings with immediate monthly estimates and visualizations.
-   **Notification System**: Global toast notifications and confirmation modals (configurable position).
-   **Theming**: Multiple built-in themes (Light, Dark, Cyberpunk, Corporate, etc.) via DaisyUI.
-   **Internationalization**: Support for English and Traditional Chinese (Tw).

## Tech Stack

-   **Framework**: React 18+ (Hooks, Context API)
-   **Language**: TypeScript
-   **Build Tool**: Vite
-   **UI Library**: DaisyUI + TailwindCSS
-   **Icons**: Lucide React
-   **Charts**: Recharts
-   **State Management**: React Context (Theme, Notification)

## Getting Started

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/asset-frontend-app.git
    cd asset-frontend-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server with HMR:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

Build the project for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Docker Deployment

This project includes a `Dockerfile` and `nginx.conf` for containerized deployment.

### Build Image
```bash
docker build -t asset-frontend-app .
```

### Run Container
Run the container on port 80:
```bash
docker run -d -p 80:80 asset-frontend-app
```

Access the application at `http://localhost`.

## Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components (Modals, Charts)
├── contexts/       # Global State (Theme, Notification)
├── hooks/          # Custom Hooks (useDepositFilter)
├── pages/          # Main route pages (Home, DepositList, CalcList, Settings)
├── services/       # API integration
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```
