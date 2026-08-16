import React from "react";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import BookingComponent from "../../components/booking/booking.component";
import ScrollToTop from "../../components/common/scroll-to-top.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import StepsGridCard from "../../components/card/steps-grid-card/steps-grid-card.component";
import BaseBtn from "../../components/button/base-button.component";

const CommunityDiningPage = () => {
  return (
    <WrapperComponent>
      <FeatureCard
        eyebrow={"community dining"}
        title={"MEET & DINE. Share a table, Meet new people."}
        subtitle={
          "Discover open reservations hosted by fellow diners. Join a table, enjoy great food, and turn every meal into a shared experience."
        }
      />

      <FeatureCard eyebrow={"How it works"} />

      <StepsGridCard
        steps={[
          {
            title: "Find a Community Dining Event",
            description:
              "Browse open reservations hosted by fellow diners and join a table for a shared dining experience.",
          },
          {
            title: "Join the Table",
            description:
              "Send a request to the host and receive confirmation before you dine, and enjoy a meal together.",
          },
          {
            title: "Enjoy the Experience",
            description:
              "Meet fellow diners, enjoy great food, and create memorable moments together.",
          },
        ]}
      />

      <div className="mt-4 mb-6 px-8 py-4 border-2 border-primary rounded-2xl">
        <FeatureCard
          eyebrow={"join a table"}
          title={"Ready to join a community dining event?"}
          subtitle={
            "Join a table hosted by someone looking to share a meal. Every open table is linked to a confirmed restaurant reservation. Review table details before joining and choose the experience that feels right for you."
          }
        />
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold uppercase">Didn't find the perfect table?</h1>
        <p className="text-base pt-2 pb-4">
          Create your own open table, choose how many seats to share, and let
          other diners request to join.
        </p>
        <BaseBtn>Create an Open Table</BaseBtn>
      </div>
    </WrapperComponent>
  );
};

export default CommunityDiningPage;
