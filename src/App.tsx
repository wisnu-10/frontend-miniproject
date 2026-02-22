import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import CreatePromotionPage from "./pages/CreatePromotionPage";
import ManagePromotionsPage from "./pages/ManagePromotionsPage";
import EditPromotionPage from "./pages/EditPromotionPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import TransactionDetailPage from "./pages/transactions/TransactionDetailPage";
import TransactionListPage from "./pages/transactions/TransactionListPage";
import OrganizerTransactions from "./pages/organizer/OrganizerTransactions";
import StatisticsPage from "./pages/organizer/StatisticsPage";
import EventAttendeesPage from "./pages/organizer/EventAttendeesPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyRewardsPage from "./pages/MyRewardsPage";
import OrganizerProfilePage from "./pages/OrganizerProfilePage";
import MyReviewsPage from "./pages/MyReviewsPage";
import WriteReviewPage from "./pages/WriteReviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { checkAuth } = useAuthStore();
  useTheme(); // Initialize theme on app load

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans">
      <ToastContainer position="bottom-right" />
      <Navbar />
      <main className="grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route
            path="/organizers/:organizerId"
            element={<OrganizerProfilePage />}
          />

          {/* Protected Routes (both roles) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER", "ORGANIZER"]} />
            }
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
            <Route path="/my-rewards" element={<MyRewardsPage />} />
            <Route path="/checkout/:eventId" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route
              path="/transactions/:id"
              element={<TransactionDetailPage />}
            />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route
              path="/events/:eventId/review"
              element={<WriteReviewPage />}
            />
          </Route>

          {/* Organizer Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
            <Route path="/organizer/dashboard" element={<DashboardPage />} />
            <Route
              path="/organizer/transactions"
              element={<OrganizerTransactions />}
            />
            <Route path="/organizer/statistics" element={<StatisticsPage />} />
            <Route
              path="/organizer/create-event"
              element={<CreateEventPage />}
            />
            <Route
              path="/organizer/events/:eventId/edit"
              element={<EditEventPage />}
            />
            <Route
              path="/organizer/events/:eventId/attendees"
              element={<EventAttendeesPage />}
            />
            <Route
              path="/organizer/events/:eventId/create-promotion"
              element={<CreatePromotionPage />}
            />
            <Route
              path="/organizer/events/:eventId/promotions"
              element={<ManagePromotionsPage />}
            />
            <Route
              path="/organizer/events/:eventId/promotions/:promoId/edit"
              element={<EditPromotionPage />}
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
