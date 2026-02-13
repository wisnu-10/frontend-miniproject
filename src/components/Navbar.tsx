import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { FaUserCircle } from "react-icons/fa";
import useDebounce from "../hooks/useDebounce";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    <div className="navbar bg-base-100 shadow-md px-4 sm:px-8">
      <div className="flex-1">
        <Link
          to="/"
          className="btn btn-ghost normal-case text-xl font-bold text-primary"
        >
          EventHype
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control hidden sm:block">
          <input
            type="text"
            placeholder="Search events..."
            className="input input-bordered w-full max-w-xs"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <FaUserCircle className="w-full h-full text-3xl" />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <span className="font-semibold text-lg">{user?.full_name}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/my-rewards">My Rewards</Link>
              </li>
              {user?.role === "ORGANIZER" && (
                <>
                  <li>
                    <Link to="/organizer/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/organizer/create-event">Create Event</Link>
                  </li>
                </>
              )}
              {user?.role === "CUSTOMER" && (
                <li>
                  <Link to="/transactions">My Transactions</Link>
                </li>
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
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
