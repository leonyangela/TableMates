import React from "react";
import { ButtonExamples } from "../../components/button/base-button.component";
import WrapperComponent from "../../components/wrapper/wrapper.component";
import {
  FeatureCardExample,
  FeatureRow,
  TestimonialCardExample,
} from "../../components/card/base-card/base-card.component";
import FeatureSection, { FeatureSectionExample, FeatureSectionExample2 } from "../../components/card/featured-card/featured-card.component";

const AllComponentsPage = () => {
  return (
    <WrapperComponent>
      <div className="relative w-full min-h-[calc(100vh-320px-68px)] p-10">
        <h1 className="text-3xl font-bold mb-4">All Components Page</h1>
        <h1 className="text-2xl font-bold my-4">Button Examples</h1>
        <ButtonExamples />

        <h1 className="text-2xl font-bold my-4">Card Examples</h1>
        <FeatureCardExample />
        <TestimonialCardExample />

        <FeatureSectionExample />
        <FeatureSectionExample2 />
      </div>
    </WrapperComponent>
  );
};

export default AllComponentsPage;
