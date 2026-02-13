import React, { useState, useEffect } from "react";
import { getMyPoints, getMyPointsHistory } from "../services/point.service";
import { getMyCoupons } from "../services/coupon.service";
import type { Point, PointHistory } from "../services/point.service";
import type { Coupon } from "../services/coupon.service";
import { FaCoins, FaTicketAlt } from "react-icons/fa";

const MyRewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"points" | "coupons">("points");
  const [totalBalance, setTotalBalance] = useState(0);
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointHistory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [pointsData, historyData, couponsData] = await Promise.all([
        getMyPoints(),
        getMyPointsHistory(),
        getMyCoupons(),
      ]);
      setTotalBalance(pointsData.total_balance);
      setActivePoints(pointsData.points);
      setPointsHistory(historyData);
      setCoupons(couponsData);
    } catch (err: any) {
      setError("Failed to load rewards data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString("id-ID");
  };

  const getDaysUntilExpiry = (dateStr: string) => {
    const now = new Date();
    const expiry = new Date(dateStr);
    const diff = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 mt-4">
      <h1 className="text-3xl font-bold text-primary mb-6">My Rewards</h1>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <button
          className={`tab tab-lg flex-1 ${activeTab === "points" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("points")}
        >
          <FaCoins className="mr-2" />
          Points
        </button>
        <button
          className={`tab tab-lg flex-1 ${activeTab === "coupons" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("coupons")}
        >
          <FaTicketAlt className="mr-2" />
          Coupons
        </button>
      </div>

      {/* Points Tab */}
      {activeTab === "points" && (
        <div>
          {/* Balance Card */}
          <div className="card bg-linear-to-r from-primary to-secondary text-primary-content mb-6">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-lg opacity-80">
                Available Points
              </h2>
              <p className="text-5xl font-bold">{formatPoints(totalBalance)}</p>
              <p className="text-sm opacity-70">points</p>
            </div>
          </div>

          {/* Active Points */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">
              Active Points Breakdown
            </h3>
            {activePoints.length === 0 ? (
              <div className="card bg-base-200 p-6 text-center text-gray-500">
                <p>
                  No active points. Invite friends with your referral code to
                  earn points!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePoints.map((point) => {
                  const daysLeft = getDaysUntilExpiry(point.expires_at);
                  return (
                    <div key={point.id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4 flex-row justify-between items-center">
                        <div>
                          <p className="font-bold text-lg text-success">
                            +{formatPoints(point.remaining_amount)} pts
                          </p>
                          <p className="text-xs text-gray-500">
                            Originally {formatPoints(point.amount)} pts • Earned{" "}
                            {formatDate(point.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`badge ${daysLeft <= 7 ? "badge-warning" : daysLeft <= 30 ? "badge-info" : "badge-success"} badge-sm`}
                          >
                            {daysLeft <= 0
                              ? "Expiring today"
                              : `${daysLeft} days left`}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires {formatDate(point.expires_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History Toggle */}
          <div className="mt-4">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show Full History"}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2">
                {pointsHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No points history yet.
                  </p>
                ) : (
                  pointsHistory.map((point) => (
                    <div
                      key={point.id}
                      className={`card bg-base-200 shadow-sm ${point.is_expired ? "opacity-50" : ""}`}
                    >
                      <div className="card-body p-3 flex-row justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {formatPoints(point.amount)} pts
                            {point.is_expired && (
                              <span className="badge badge-error badge-xs ml-2">
                                Expired
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(point.created_at)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>
                            Remaining: {formatPoints(point.remaining_amount)}
                          </p>
                          <p>Expires: {formatDate(point.expires_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === "coupons" && (
        <div>
          {coupons.length === 0 ? (
            <div className="card bg-base-200 p-8 text-center text-gray-500">
              <FaTicketAlt className="mx-auto text-4xl mb-3 opacity-30" />
              <p>No coupons yet.</p>
              <p className="text-sm mt-1">
                Register with a referral code to get a discount coupon!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`card bg-base-200 shadow-sm ${!coupon.is_valid ? "opacity-60" : ""}`}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <code className="bg-base-300 px-3 py-1 rounded font-mono text-sm tracking-wider">
                          {coupon.code}
                        </code>
                        <p className="mt-2 font-bold text-lg text-primary">
                          {coupon.discount_percentage
                            ? `${coupon.discount_percentage}% OFF`
                            : coupon.discount_amount
                              ? `Rp ${coupon.discount_amount.toLocaleString("id-ID")} OFF`
                              : "Discount"}
                        </p>
                      </div>
                      <div className="text-right">
                        {coupon.is_used ? (
                          <span className="badge badge-neutral">Used</span>
                        ) : coupon.is_expired ? (
                          <span className="badge badge-error">Expired</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <p>
                        Valid: {formatDate(coupon.valid_from)} —{" "}
                        {formatDate(coupon.valid_until)}
                      </p>
                      {coupon.is_valid && (
                        <p className="text-warning mt-1">
                          {getDaysUntilExpiry(coupon.valid_until)} days
                          remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRewardsPage;
