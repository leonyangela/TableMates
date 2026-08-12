import React from "react";
import { ButtonExamples } from "../../components/button/base-button.component";
import WrapperComponent from "../../components/wrapper/wrapper.component";
import {
  BaseCardExample,
  FeatureRow,
  TestimonialCardExample,
} from "../../components/card/base-card/base-card.component";
import FeatureCard, {
  FeatureCardExample,
  FeatureCardExample2,
} from "../../components/card/featured-card/featured-card.component";
import { ItemCardExample } from "../../components/card/item-card/item-card.component";

const AllComponentsPage = () => {
  return (
    <WrapperComponent>
      <div className="relative w-full min-h-[calc(100vh-320px-68px)] p-10">
        <h1 className="text-3xl font-bold mb-4">All Components Page</h1>
        <h1 className="text-2xl font-bold my-4">Button Examples</h1>
        <ButtonExamples />

        <h1 className="text-2xl font-bold my-4">Card Examples</h1>
        <BaseCardExample />
        <TestimonialCardExample />

        <FeatureCardExample />
        <FeatureCardExample2 />

        <h1 className="text-2xl font-bold my-4">Restaurant Item Cards</h1>
        <ItemCardExample />
      </div>
    </WrapperComponent>
  );
};

export default AllComponentsPage;
