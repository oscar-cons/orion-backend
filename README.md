# Firebase Studio Project - DarkWeb Insights

This is a Next.js application built in Firebase Studio for monitoring the criminal web ecosystem. It uses Next.js, React, ShadCN, Tailwind CSS, and Genkit for AI features.

## Running Locally

To run this project on your local machine for backend development (e.g., in Cursor), follow these steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 20 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (for authenticating Genkit)

### 1. Set up your Environment

First, install the project dependencies:
```bash
npm install
```

### 2. Configure Environment Variables

This project uses Genkit with Google AI. To authenticate your local environment, you need to set up Application Default Credentials for Google Cloud.

Run the following command in your terminal:
```bash
gcloud auth application-default login
```
This will open a browser window for you to log in to your Google account and authorize access.

Alternatively, you can create a `.env.local` file in the root of the project and add your Google AI API key:

```
# .env.local
GOOGLE_API_KEY="your_google_api_key_here"
```

You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the Development Servers

This project has two main parts that need to run simultaneously in separate terminal windows:

**Terminal 1: Start the Next.js Frontend**
```bash
npm run dev
```
This will start the Next.js application, usually on [http://localhost:3000](http://localhost:3000).

**Terminal 2: Start the Genkit AI Backend**
```bash
npm run genkit:dev
```
This starts the Genkit development server, which runs the AI flows your application uses.



