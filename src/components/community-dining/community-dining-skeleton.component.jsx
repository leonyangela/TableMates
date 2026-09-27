export default function CommunityDiningSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse bg-paper/5"
          />
        )
      )}
    </div>
  );
}