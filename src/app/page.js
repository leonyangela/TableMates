import Hero from "@/components/hero/hero.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import HomeContent from "@/components/homepage/home-content.component";
import { getHomepageSummary } from "@/services/restaurantService";

// The homepage is static and regenerated at most once an hour, so reading
// and ranking the restaurant collection happens once per hour instead of
// once per visitor. Restaurant data changes rarely (admins seed it).
export const revalidate = 3600;

// A regeneration shouldn't hang on Firestore; the page falls back to
// fetching in the browser instead.
const SUMMARY_TIMEOUT_MS = 8000;

async function loadSummary() {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timed out")), SUMMARY_TIMEOUT_MS);
  });

  try {
    return await Promise.race([getHomepageSummary(), timeout]);
  } catch (error) {
    console.error("Homepage summary unavailable, falling back to the client:", error.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function Home() {
  const summary = await loadSummary();

  return (
    <WrapperComponent paddingY="none">
      <Hero summary={summary} />
      <HomeContent summary={summary} />
    </WrapperComponent>
  );
}
