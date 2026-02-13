import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import CreatePromotionPage from "./pages/CreatePromotionPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import TransactionDetailPage from "./pages/transactions/TransactionDetailPage";
import TransactionListPage from "./pages/transactions/TransactionListPage";
import OrganizerTransactions from "./pages/organizer/OrganizerTransactions";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />

          {/* App Routes */}
          <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
            <Route path="/checkout/:eventId" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          </Route>

          {/* Organizer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
            <Route path="/organizer/dashboard" element={<DashboardPage />} />
            <Route path="/organizer/transactions" element={<OrganizerTransactions />} />
            <Route
              path="/organizer/create-event"
              element={<CreateEventPage />}
            />
            <Route
              path="/organizer/events/:eventId/create-promotion"
              element={<CreatePromotionPage />}
            />
          </Route>
        </Routes>
      </main>
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <aside>
          <p>Copyright © 2024 - All right reserved by EventHype</p>
        </aside>
      </footer>
    </div>
  );
}

export default App;
