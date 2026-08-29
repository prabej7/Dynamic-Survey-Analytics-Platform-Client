# Dynamic Survey Analytics Platform — Frontend

Frontend application for the Dynamic Survey Analytics Platform.

The application provides an intuitive interface for creating surveys, configuring questions and conditional logic, publishing surveys, collecting responses, and viewing survey analytics.

Built with **React, TypeScript, Vite, Tailwind CSS, and shadcn/ui**.

---

## Features

- User authentication
- Login and registration
- Protected routes
- Survey dashboard
- Create and edit surveys
- Dynamic survey builder
- Multiple question types
- Conditional question logic
- Live survey preview
- Survey publishing
- Public survey pages
- Copy survey link
- Response management
- Response details
- Survey analytics
- Search and filtering
- Responsive UI
- Toast notifications
- Loading states and skeletons
- Custom 404 / Not Found page

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | UI library |
| TypeScript | Type safety |
| Vite | Build tool |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Lucide React | Icons |
| Axios | API communication |
| Sonner | Toast notifications |

---

## Project Structure

```text
frontend/
├── public/
│   └── ...
│
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── switch.tsx
│   │       └── textarea.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   ├── surveys/
│   │   ├── responses/
│   │   └── ...
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── surveyApi.ts
│   │   └── responseApi.ts
│   │
│   ├── types/
│   │   └── survey.ts
│   │
│   ├── utils/
│   │   └── apiError.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
````

---

## Requirements

Make sure you have:

* Node.js 18+
* npm
* Git

Check your versions:

```bash
node --version
npm --version
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/prabej7/Dynamic-Survey-Analytics-Platform.git
```

Navigate to the frontend:

```bash
cd Dynamic-Survey-Analytics-Platform/frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the frontend directory.

```env
VITE_API_URL=http://localhost:5000
```

For production:

```env
VITE_API_URL=https://your-backend.vercel.app
```

### Environment Variables

| Variable       | Description                 |
| -------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the backend API |

Vite only exposes environment variables prefixed with `VITE_` to the client.

---

## Running the Application

### Development

```bash
npm run dev
```

The application will typically be available at:

```text
http://localhost:5173
```

---

## Production Build

Build the application:

```bash
npm run build
```

The production files will be generated inside:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
```

---

# API Configuration

API requests are handled through a centralized Axios instance.

Example:

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default api;
```

The `withCredentials: true` option is required because authentication uses HTTP-only cookies.

---

# 🔐 Authentication

The application uses cookie-based authentication.

After a successful login:

```text
Frontend
    │
    │ POST /auth/login
    ▼
Backend
    │
    │ Set-Cookie: accessToken
    ▼
Browser
```

The authentication token is stored in an HTTP-only cookie rather than localStorage.

Authenticated requests automatically include the cookie when Axios is configured with:

```typescript
withCredentials: true
```

---

# Application Routes

The application contains protected and public routes.

Example route structure:

```text
/
├── /login
├── /register
│
├── /dashboard
│
├── /surveys
│   ├── /surveys/new
│   └── /surveys/:id/edit
│
├── /responses
│   └── /responses/:id
│
├── /analytics
│   └── /analytics/:id
│
├── /survey/:slug
│
└── *
    └── Not Found
```

---

# Survey Builder

The survey builder allows authenticated users to create and edit surveys.

Users can configure:

* Survey title
* Description
* URL slug
* Questions
* Question order
* Required questions
* Question types
* Question options
* Conditional logic

---

# Question Types

The frontend supports four question types:

```text
TEXT
SINGLE_SELECT
MULTI_SELECT
RATING
```

### Text

```text
What is your name?
[_____________________]
```

### Single Select

```text
Are you satisfied?

○ Yes
○ No
```

### Multiple Select

```text
Which features do you use?

☐ Analytics
☐ Reports
☐ Notifications
```

### Rating

```text
How would you rate our service?

[1] [2] [3] [4] [5]
```

---

# Conditional Logic

Questions can be displayed conditionally based on previous answers.

For example:

```text
Question A

Are you satisfied with our service?

○ Yes
○ No
```

If the user selects:

```text
No
```

then:

```text
Question B

Please tell us why.
[________________________]
```

A condition is represented as:

```typescript
{
  questionId: "question-a",
  operator: "equals",
  value: "no"
}
```

Supported operators:

```text
equals
not_equals
contains
greater_than
less_than
```

---

# Live Preview

The survey builder includes a live preview panel.

Changes made to the survey builder are immediately reflected in the preview.

The preview supports:

* Survey title
* Description
* Question labels
* Required indicators
* Text inputs
* Single-select options
* Multiple-select options
* Rating questions
* Submit button preview

---

# Copy Survey Link

Once a survey has been created and has a valid slug, users can copy its public URL.

Example:

```text
https://your-frontend.vercel.app/survey/customer-satisfaction
```

The builder provides a:

```text
Copy Link
```

button that copies the survey URL to the clipboard.

---

# Public Surveys

Public surveys are accessible through their slug:

```text
/survey/:slug
```

Example:

```text
/survey/customer-satisfaction
```

Users can open the link and submit their responses without accessing the survey management dashboard.

---

# Responses

The responses section allows survey owners to:

* View submitted responses
* Search responses
* Filter responses by survey
* View individual responses
* Delete responses
* See submission date and time
* See the number of answers

---

# Analytics

The analytics interface provides an overview of survey responses.

Depending on the survey question types, analytics can display:

* Total responses
* Answer distributions
* Rating statistics
* Question-level results
* Response trends

---

# UI

The frontend uses:

* Tailwind CSS
* shadcn/ui
* Lucide icons
* Responsive layouts
* Cards
* Dialogs
* Dropdown menus
* Select inputs
* Skeleton loading states
* Toast notifications

The interface is designed to work across:

```text
Desktop
Tablet
Mobile
```

---

# Error Handling

API errors are handled centrally through a utility:

```typescript
handleApiError(error);
```

The application displays user-friendly toast notifications instead of exposing raw server errors.

Example:

```text
Failed to load survey
Survey created successfully
Survey link copied to clipboard
Failed to save survey
```

---

# Loading States

The application uses skeleton loaders while waiting for API responses.

Example:

```text
┌──────────────────────────────┐
│ █████████████████            │
│ ██████████                   │
│                              │
│ ███████████████████          │
│ █████████                    │
└──────────────────────────────┘
```

This prevents abrupt layout changes while data is being loaded.

---

# Deployment on Vercel

The frontend is designed to be deployed on Vercel.

### Build Command

```bash
npm run build
```

### Output Directory

```text
dist
```

### Install Command

```bash
npm install
```

---

## Vercel Environment Variable

Add the following environment variable in the Vercel project settings:

```text
VITE_API_URL
```

Example:

```text
VITE_API_URL=https://your-backend.vercel.app
```

After changing environment variables, redeploy the application.

---

# SPA Routing on Vercel

Because the application uses React Router, Vercel needs to redirect unknown routes to `index.html`.

Create a `vercel.json` file in the frontend root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows routes such as:

```text
/surveys
/surveys/new
/surveys/123/edit
/responses
/survey/customer-satisfaction
```

to work correctly when the page is refreshed.

---

# Production Cookie Requirements

Because the frontend and backend may be deployed on separate Vercel domains, authentication cookies require proper cross-origin configuration.

The frontend Axios client should use:

```typescript
withCredentials: true
```

Example:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```

The backend must also enable credentialed CORS and configure cookies appropriately for production.

---

# Development Workflow

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

The frontend communicates with:

```text
http://localhost:5000
```

---

# Application Architecture

```text
                    ┌──────────────────┐
                    │      Browser     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      React       │
                    │    Components    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  React Router    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Service Layer    │
                    │     Axios        │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             ▼
                    ┌──────────────────┐
                    │ Express Backend  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    PostgreSQL    │
                    └──────────────────┘
```

---

# Production Build Flow

```text
Source Code
     │
     ▼
TypeScript + React
     │
     ▼
Vite
     │
     ▼
npm run build
     │
     ▼
dist/
     │
     ▼
Vercel
     │
     ▼
Production Application
```

---

# Future Improvements

Potential improvements include:

* Drag-and-drop question ordering
* More question types
* Advanced conditional branching
* Survey templates
* Autosave
* Draft/published states
* Improved analytics visualizations
* CSV export
* PDF report generation
* Dark mode
* Accessibility improvements
* Offline survey support
* Survey response pagination

---

