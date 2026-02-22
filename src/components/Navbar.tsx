import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import useDebounce from "../hooks/useDebounce";
import { useTheme } from "../hooks/useTheme";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // Initialize from URL param if present
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update URL when debounced term changes
  useEffect(() => {
    // Only navigate if the value has changed from what's potentially in the URL
    const currentSearchInUrl = searchParams.get("search") || "";

    if (debouncedSearchTerm !== currentSearchInUrl) {
      if (debouncedSearchTerm) {
        navigate(`/?search=${debouncedSearchTerm}`);
      } else {
        // Remove search param if empty
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("search");
        const newSearchString = newSearchParams.toString();
        navigate(newSearchString ? `/?${newSearchString}` : "/");
      }
    }
  }, [debouncedSearchTerm, navigate, searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="navbar sticky top-0 z-50 glass-header px-4 sm:px-8 transition-all duration-300">
      <div className="flex-1">
        <Link
          to="/"
          className="btn btn-ghost normal-case text-2xl font-black tracking-tight text-primary hover:bg-transparent"
        >
          EventHype
        </Link>
      </div>
      <div className="flex-none gap-4">
        {/* Search input with modern styling */}
        <div className="form-control hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search amazing events..."
            className="input input-bordered w-full md:w-64 lg:w-80 pl-10 bg-base-100/50 focus:bg-base-100 transition-all duration-300 focus:ring-2 focus:ring-primary/20 border-base-300"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <FaMoon className="text-xl text-primary" />
          ) : (
            <FaSun className="text-xl text-warning" />
          )}
        </button>

        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar ring ring-transparent hover:ring-primary/30 transition-all duration-300"
            >
              <div className="w-10 rounded-full bg-base-200 flex items-center justify-center text-primary">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" />
                ) : (
                  <FaUserCircle className="w-full h-full text-3xl" />
                )}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-4 p-3 shadow-xl menu menu-compact dropdown-content bg-base-100 rounded-2xl w-56 border border-base-200/50"
            >
              <li className="px-2 py-1 mb-2">
                <span className="font-bold text-lg text-base-content tracking-tight">
                  {user?.full_name}
                </span>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full w-max mt-1">
                  {user?.role}
                </span>
              </li>
              <div className="divider my-1 h-px bg-base-200"></div>
              <li>
                <Link
                  to="/profile"
                  className="rounded-xl hover:bg-base-200 transition-colors"
                >
                  Profile
                </Link>
              </li>
              {user?.role === "ORGANIZER" && (
                <>
                  <li>
                    <Link to="/organizer/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/organizer/transactions">Transactions</Link>
                  </li>
                  <li>
                    <Link to="/organizer/statistics">Statistics</Link>
                  </li>
                  <li>
                    <Link to="/organizer/create-event">Create Event</Link>
                  </li>
                </>
              )}
              {user?.role === "CUSTOMER" && (
                <>
                  <li>
                    <Link to="/my-rewards">My Rewards</Link>
                  </li>
                  <li>
                    <Link to="/transactions">My Transactions</Link>
                  </li>
                  <li>
                    <Link to="/my-reviews">My Reviews</Link>
                  </li>
                </>
              )}
              <div className="divider my-0"></div>
              <li>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-3 items-center ml-2">
            <Link
              to="/login"
              className="btn btn-ghost rounded-full font-semibold hover:bg-base-200"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="btn btn-primary rounded-full font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
