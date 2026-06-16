// Default staging indicator — customize the appearance and message per project.
// Controlled by NEXT_PUBLIC_APP_ENV=staging (set in Vercel's Preview environment).
export function StagingBanner() {
  // Temporarily always show to confirm component renders — env check restored after diagnosis
  // if (process.env.NEXT_PUBLIC_APP_ENV !== "staging") return null;

  return (
    <div className="w-full bg-blue-600 text-white text-center text-sm py-1 font-medium tracking-wide">
      STAGING ENVIRONMENT
    </div>
  );
}
