import api from "./api";

export interface Point {
  id: string;
  amount: number;
  remaining_amount: number;
  expires_at: string;
  created_at: string;
}

export interface PointHistory extends Point {
  is_expired: boolean;
}

export const getMyPoints = async (): Promise<{
  total_balance: number;
  points: Point[];
}> => {
  const response = await api.get("/users/me/points");
  return response.data;
};

export const getMyPointsHistory = async (): Promise<PointHistory[]> => {
  const response = await api.get<{ history: PointHistory[] }>(
    "/users/me/points/history",
  );
  return response.data.history;
};
