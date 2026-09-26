import Hero from "@/components/hero/hero.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import HomeContent from "@/components/homepage/home-content.component";
import CuisineMarquee from "@/components/homepage/cuisine-marquee.component";

export default function Home() {
  return (
    <WrapperComponent paddingY="none">
      <div className="px-3 pt-3">
        <Hero />
      </div>

      <div className="px-3 pt-3">
        <CuisineMarquee />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <HomeContent />
      </div>
    </WrapperComponent>
  );
}
