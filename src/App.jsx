import "./App.css";

import { Route, Routes } from "react-router";
import { useEffect } from "react";

import { useAuthStore } from "./store/useAuthStore";

import LandingPage from "./pages/landing/landing-page.page";
import LoginPage from "./pages/auth/login.page";
import RestaurantPage from "./pages/restaurant/restaurant.page";
import SignUpPage from "./pages/auth/sign-up.page";
import DiningJourneyPage from "./pages/dining-journey/dining-journey.page";
import CommunityDiningPage from "./pages/community-dining/community-dining.page";
import AllComponentsPage from "./pages/components/all-components.page";
import ScrollToTop from "./utils/scrollTop.utils";

function App() {
  // const { onAuthListener } = useAuthStore.getState();

  useEffect(() => {
    // onAuthListener();
    const unsubscribe = useAuthStore.getState().onAuthListener();
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <>
    <ScrollToTop />
      <Routes>
        <Route index path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route path="/restaurants" element={<RestaurantPage />} />
        <Route path="/community-dining" element={<CommunityDiningPage />} />
        <Route path="/dining-journey" element={<DiningJourneyPage />} />

        <Route path="/components" element={<AllComponentsPage />} />
      </Routes>
    </>
  );
}

export default App;
