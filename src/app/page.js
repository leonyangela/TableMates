import Hero from "@/components/hero/hero.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import HomeContent from "@/components/homepage/home-content.component";

export default function Home() {
  return (
    <WrapperComponent>
      <div className="w-full h-auto pt-0 px-2">
        <Hero />
      </div>

      <div className="py-10 px-10">
        <HomeContent />
      </div>
    </WrapperComponent>
  );
}
