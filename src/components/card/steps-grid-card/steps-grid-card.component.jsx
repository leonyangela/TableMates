import React from "react";

/**
 * StepsGrid
 *
 * Generic numbered-step layout ("01 — Title — description") arranged in a
 * responsive grid. Not tied to any specific feature — pass in whatever
 * steps you need and reuse it anywhere a short numbered process needs to
 * be explained (landing page "how it works", community dining flow, etc.).
 *
 * Props:
 *  - steps: Array<{
 *      number?: string | number;   // defaults to auto "01", "02", ...
 *      title: string;
 *      description: string;
 *    }>
 *  - columns?: string   // Tailwind grid-cols classes, default responsive 1 -> 3
 */
const StepsGridCard = ({ steps, columns = "grid-cols-1 sm:grid-cols-3" }) => {
  return (
    <div className={`grid ${columns} gap-8 sm:gap-4`}>
      {steps.map((step, index) => {
        const number = step.number ?? String(index + 1).padStart(2, "0");
        return (
          <div key={step.title ?? index}>
            <h3 className="font-bold text-4xl">{number}</h3>
            <h3 className="font-bold text-3xl py-2">{step.title}</h3>
            <p>{step.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StepsGridCard;
