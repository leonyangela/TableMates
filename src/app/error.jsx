"use client";

import { useEffect } from "react";

import WrapperComponent from "@/components/wrapper/wrapper.component";
import PageHeader from "@/components/ui/page-header.component";
import Button from "@/components/button/button.component";

/**
 * Catches anything a page throws while rendering, so one broken section
 * shows a way forward instead of a blank screen. The root layout (auth,
 * session effects) stays mounted.
 */
export default function ErrorPage({ error, retry }) {
  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  return (
    <WrapperComponent>
      <PageHeader
        meta={["Error"]}
        title="Something"
        muted="went wrong."
        intro="This page couldn&apos;t load. Try again, or head back to the restaurants."
        actions={
          <>
            <Button onClick={() => retry()}>Try again</Button>
            <Button href="/restaurants" variant="outline" arrow>
              Browse restaurants
            </Button>
          </>
        }
      />
    </WrapperComponent>
  );
}
