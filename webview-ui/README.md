# AI Chat Assistant - VS Code Extension
## WebView UI (Frontend)

This project contains the React-based frontend user interface for the AI Chat Assistant VS Code extension. It runs inside a VS Code WebView.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Getting Started

1.  **Clone the main repository (if you haven't already):**
    ```bash
    git clone https://github.com/aakash4456/Ai-chat-assistant-extension.git
    ```

2.  **Navigate to the frontend directory:**
    ```bash
    cd Ai-chat-assistant-extension/webview-ui
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

5.  **Open your browser:**
    Visit [http://localhost:5173](http://localhost:5173) to view the app.

## Project Structure

-   `src/`
    -   `components/`
    -   `App.tsx`
    -   `main.tsx`
-   `public/`
-   `vite.config.ts`

## Available Scripts

-   `npm run dev` - Starts the Vite development server for live reloading.
-   `npm run build` - Bundles the application for production. This is the command the VS Code extension uses to get the final UI files.

## Additional Information

-   **Important:** This frontend is designed to run within a VS Code WebView. When you run `npm run dev`, features that communicate with the extension (like file picking with `@`) will not work, as they depend on the VS Code API backend. The dev server is primarily for UI development and styling.
-   To test the full, integrated functionality, you must run the extension from the root directory using the `F5` debugger in VS Code.