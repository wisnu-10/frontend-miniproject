import api from "./api";

export interface Point {
    id: string;
    user_id: string;
    amount: number;
    remaining_amount: number;
    expires_at: string;
}

export const getMyPoints = async (): Promise<{ total_points: number, points: Point[] }> => {
    const response = await api.get("/points/my-points");
    return response.data.data;
};
