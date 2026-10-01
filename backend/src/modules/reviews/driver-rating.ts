import mongoose from "mongoose";
import Review from "../../database/models/Review";

/**
 * A driver's star rating, averaged over the reviews customers left for them.
 *
 * There is no `rating` field on the Driver model — ratings only exist as Review
 * documents — so anything that wants to show a driver's rating (the tracking
 * sheet's partner row, for one) has to aggregate them here.
 *
 * `driverRating` is the per-driver score a combined food review carries; a plain
 * ride/task review only sets `rating`, so the average falls back to that.
 */
export interface DriverRating {
  rating: number | null;
  ratingCount: number;
}

export async function getDriverRating(driverId: unknown): Promise<DriverRating> {
  if (!driverId || !mongoose.isValidObjectId(String(driverId))) {
    return { rating: null, ratingCount: 0 };
  }

  const [result] = await Review.aggregate([
    { $match: { driver: new mongoose.Types.ObjectId(String(driverId)) } },
    {
      $group: {
        _id: null,
        // $ifNull rather than two passes: a review that scored the driver
        // separately wins, otherwise the order's overall score stands in.
        average: { $avg: { $ifNull: ["$driverRating", "$rating"] } },
        count: { $sum: 1 },
      },
    },
  ]);

  if (!result || !result.count || result.average == null) {
    return { rating: null, ratingCount: 0 };
  }

  return {
    rating: Math.round(result.average * 10) / 10,
    ratingCount: result.count,
  };
}
