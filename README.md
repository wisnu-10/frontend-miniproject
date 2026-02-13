# EventHype - Frontend

EventHype is a modern event discovery and management platform. This repository contains the frontend application, built with React, TypeScript, and Vite.

## Features

### 🛒 Event Discovery
- **Browse Events**: View a list of upcoming events with infinite scroll/pagination support.
- **Search**: Real-time search by event name.
- **Filtering**: Filter events by category, location (city), price range, and free/paid status.
- **Event Details**: comprehensive view of event information, including description, date/time, location, and ticket availability.

### 💳 Functionality: Transactions
- **Checkout**: Seamless booking flow for purchasing event tickets (Customer Only).
- **Discounts**: Apply Promotions, Coupons, or Points to your purchase (exclusive selection).
- **Payment**: Upload payment proof for manual verification.
- **History**: View past transactions with status tracking and filter options (Customer Only).
- **Countdown**: Real-time timer for pending payments to ensure timely completion.

### 👥 User Roles
- **Customer**: Browse, book events, and manage personal transactions.
- **Organizer**: Create events, manage promotions, and verify/reject customer transactions.

### 🔧 Organizer Dashboard
- **Dashboard**: View a list of created events.
- **Create Event**: Comprehensive form to publish new events with multiple ticket types.
- **Promotions**: Create discount vouchers for events.
- **Transaction Management**: View all transactions for owned events and accept/reject them with ease.
- **Management**: Edit and delete events.

### 🔐 Authentication
- **Secure Login/Register**: User authentication using JWT and HttpOnly cookies.
- **Role-Based Access Control**: Protected routes for organizer-only features.

## Tech Stack

- **Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Forms**: [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the frontend directory**:
    ```bash
    cd frontend-miniproject
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173`.

### Key Components Structure

- `src/components`: Reusable UI components (Navbar, EventCard, FilterSidebar).
- `src/pages`: Page components corresponding to routes (HomePage, EventDetailsPage, CreateEventPage).
    - `src/pages/checkout`: Checkout flow components.
    - `src/pages/transactions`: Transaction history and detail pages.
    - `src/pages/organizer`: Organizer-specific dashboards and forms.
- `src/services`: API integration logic (`api.ts`, `transaction.service.ts`).
- `src/store`: Global state management (`useAuthStore.ts`).
- `src/types`: TypeScript interfaces and types.
- `src/hooks`: Custom hooks (`useDebounce.ts`).

## API Integration

The frontend is configured to communicate with the backend at `http://localhost:8000/api`. Ensure your backend server is running and accessible at this URL.

## License

[MIT](LICENSE)
