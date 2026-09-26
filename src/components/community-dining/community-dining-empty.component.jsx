export default function CommunityDiningEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-grey-olive-200 p-10 text-center">
      <h2 className="text-lg font-semibold text-grey-olive-900">
        No open tables right now
      </h2>

      <p className="mt-2 text-sm text-grey-olive-500">
        Check back later to discover an open
        table and share a meal with others.
      </p>
    </div>
  );
}