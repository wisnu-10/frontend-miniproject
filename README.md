# EventHype - Frontend

EventHype is a modern event discovery and management platform. This repository contains the frontend application, built with React, TypeScript, and Vite.

## Features

### 🧭 Core Navigation
- **Responsive Navbar**: Modern layout featuring a prominent, centered search bar for quick event discovery, an integrated Light/Dark theme toggle, and a streamlined user profile menu for easy account and role-specific dashboard access.

### 🛒 Event Discovery
- **Browse Events**: View a paginated list of upcoming events (9 per page) with page navigation controls and a "Showing X–Y of Z events" result summary. Event cards now display the **organizer's name** for better transparency. Page resets to 1 when filters or search terms change. **Finished events** (past their end date) are automatically hidden from the listing.
- **Search**: Real-time search by event name.
- **Filtering**: Filter events by category, location (city), price range, and free/paid status. Categories are dynamically loaded from `GET /categories` (sent as `category_id` query param) and locations from `GET /events/meta/locations` (displayed as `City, Province`).
- **Event Details**: Comprehensive view of event information, including description, date/time, location, the **organizer's name**, ticket availability (presented in a clean, proportional table layout), and user reviews.

### 💳 Functionality: Transactions
- **Checkout**: Seamless booking flow for purchasing event tickets (Customer Only).
- **Discounts**: Apply Promotions, Coupons, or Points to your purchase (exclusive selection) with a compact, side-by-side UI for easy selection.
- **Payment**: Upload payment proof for manual verification.
- **History**: View past transactions with status tracking and filter options (Customer Only).
- **Countdown**: Real-time timer for pending payments to ensure timely completion.

### 👥 User Roles
- **Customer**: Browse, book events, and manage personal transactions.
- **Organizer**: Create events, manage promotions, and verify/reject customer transactions.

### 🔧 Organizer Dashboard
- **Dashboard**: View a list of created events.
- **Create Event**: Comprehensive form to publish new events with multiple ticket types. Features an enlarged description area for detailed event information. Categories are dynamically loaded from the backend API. Supports **image upload** via Cloudinary (JPEG/PNG/WebP, max 2MB) with preview. Includes a **Free Event** checkbox that, when checked, hides the base price and ticket types/pricing sections and automatically sets all prices to zero. **Field syncing**: changing the base price automatically updates the default (first) ticket type's price; total seats is auto-calculated as the sum of all ticket type quantities (read-only for paid events, manually editable for free events).
- **Promotions**: Full promotion management — create, view all promotions in a table with status badges (Active/Expired/Maxed), edit discount details, and delete unused promotions. Delete is disabled for promotions that have already been used.
- **Transaction Management**: View all transactions for owned events and accept/reject them with ease.
- **Management**: Edit and delete events.

### ⭐ Event Reviews & Ratings
- **Write Review**: Dedicated review page (`/events/:eventId/review`) with eligibility check, event info display, interactive star picker with descriptive labels, and character counter. Shows clear messaging for ineligible users (not attended / already reviewed).
- **Submit from Transactions**: Completed (`DONE`) transactions display a "Write a Review" call-to-action linking directly to the review page.
- **Event Reviews**: View paginated reviews with sorting by date or rating on any event detail page.
- **Organizer Profile**: Public profile page (`/organizers/:organizerId`) showing organizer info, aggregate rating stats with distribution bar chart, and recent reviews.
- **My Reviews**: Customer-only page (`/my-reviews`) accessible from the navbar dropdown, to view, edit, and delete own reviews.

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

- `src/components`: Reusable UI components (Navbar, EventCard, FilterSidebar, Pagination).
- `src/pages`: Page components corresponding to routes (HomePage, EventDetailsPage, CreateEventPage, OrganizerProfilePage, MyReviewsPage, WriteReviewPage).
    - `src/pages/checkout`: Checkout flow components.
    - `src/pages/transactions`: Transaction history and detail pages.
    - `src/pages/organizer`: Organizer-specific dashboards and forms.
- `src/services`: API integration logic (`api.ts`, `transaction.service.ts`, `review.service.ts`, `promotion.service.ts`).
- `src/store`: Global state management (`useAuthStore.ts`).
- `src/types`: TypeScript interfaces and types (`index.ts`, `transaction.ts`, `review.ts`).
- `src/validation`: Yup validation schemas (`login`, `register`, `profile`, `password`, `review`).
- `src/hooks`: Custom hooks (`useDebounce.ts`).

## API Integration

The frontend is configured to communicate with the backend at `http://localhost:8000/api`. Ensure your backend server is running and accessible at this URL.

## License

[MIT](LICENSE)
