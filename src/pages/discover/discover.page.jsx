import React from "react";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import BookingComponent from "../../components/booking/booking.component";
import ScrollToTop from "../../components/common/scroll-to-top.component";

const DiscoverPage = () => {
  return (
    <WrapperComponent>
      <ScrollToTop />
      {/* <h1 className="text-5xl text-center py-40">Discover Page</h1> */}

      <BookingComponent />
    </WrapperComponent>
  );
};

export default DiscoverPage;
