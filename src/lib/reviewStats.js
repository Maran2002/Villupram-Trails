export async function recalculatePlaceReviewStats(db, placeId, session) {
  const [stats] = await db.collection('reviews').aggregate([
    { $match: { placeId, visible: true } },
    {
      $group: {
        _id: null,
        reviewCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ], { session }).toArray()

  const result = await db.collection('places').updateOne(
    { _id: placeId },
    {
      $set: {
        reviewCount: stats?.reviewCount || 0,
        rating: Math.round((stats?.averageRating || 0) * 10) / 10,
      },
    },
    { session }
  )

  if (result.matchedCount !== 1) throw new Error('Place not found while updating review aggregates')
}

export async function decrementReviewContribution(db, userId, session, amount = 1) {
  if (!userId) return
  await db.collection('users').updateOne(
    { _id: userId },
    [{
      $set: {
        'contributions.reviewsWritten': {
          $max: [0, { $subtract: [{ $ifNull: ['$contributions.reviewsWritten', 0] }, amount] }],
        },
      },
    }],
    { session }
  )
}
