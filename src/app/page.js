import Hero from "@/components/hero/hero.component";
import WrapperComponent from "@/components/wrapper/wrapper.component";
import HomeContent from "@/components/homepage/home-content.component";

export default function Home() {
  return (
    <WrapperComponent paddingY="none">
      <Hero />
      <HomeContent />
    </WrapperComponent>
  );
}
