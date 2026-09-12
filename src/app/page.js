import Navbar from "@/components/navbar/navbar.component";
import Hero from "@/components/hero/hero.component";
import Header from "@/components/header/header.component";
import Button from "@/components/button/button.component";
import Testimonials from "@/components/testimonials/testimonials.component";
import FeatureCard from "@/components/cards/feature-card.component";
import StepCard from "@/components/cards/step-card.component";

import { FEATURES, STEPS } from "./page.constants";
import Footer from "@/components/footer/footer.component";

export default function Home() {
  return (
    <div className="relative">
      <Navbar />

      <div className="w-full h-auto pt-0 px-2">
        <Hero />
      </div>

      <div className="py-10 px-10">
        <Header
          eyebrow={"Discover Restaurants"}
          title={"Find the perfect place for every craving."}
          description={
            "Explore restaurants for every occasion, from neighborhood favorites to trending hotspots. Browse by cuisine, location, or mood and discover places worth coming back to."
          }
        />

        {/* Trending Restaurant */}

        {/* Top Restaurants */}
        <article>
          <h1 className="font-bold text-xl">Top Restaurants</h1>
        </article>

        <article className="mt-10 flex flex-row gap-4 bg-gray-200 rounded-md p-8">
          <div className="w-2/6 flex flex-col justify-between">
            <div>
              <Header eyebrow={"Why choose us?"} />
              <h1 className="text-3xl font-bold ">More than just a table.</h1>
            </div>
            <p className="pt-10">
              We make it easy to find, book and enjoy the best restaurants, with
              features designed for food lovers.
            </p>
          </div>

          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </article>

        <div className="relative pt-20">
          <div className="flex flex-row gap-4 justify-between items-center pb-10">
            <Header
              title={"How it works"}
              description={"From craving to table, in four steps."}
            />

            <Button>Find a Restaurant</Button>
          </div>

          <div className="w-full z-20 flex gap-4 ">
            {STEPS.map((step, id) => (
              <StepCard key={id} {...step} />
            ))}
          </div>
        </div>

        <div className="pt-20 pb-20 ">
          <Testimonials />
        </div>
      </div>

      <Footer />
    </div>
  );
}
