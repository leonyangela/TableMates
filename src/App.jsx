import "./App.css";

import { Route, Routes } from "react-router";
import { useEffect } from "react";

import { useAuthStore } from "./store/useAuthStore";

import LandingPage from "./pages/landing/landing-page.page";
import LoginPage from "./pages/auth/login.page";
import DiscoverPage from "./pages/discover/discover.page";
import RestaurantPage from "./pages/restaurant/restaurant.page";
import SignUpPage from "./pages/auth/sign-up.page";
import DiningJourneyPage from "./pages/dining-journey/dining-journey.page";

function App() {
const { onAuthListener } = useAuthStore.getState();
  useEffect(() => {
    // onAuthListener();
    const unsubscribe = useAuthStore.getState().onAuthListener();
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <>
      <Routes>
        <Route index path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/restaurant" element={<RestaurantPage />} />
        <Route path="/dining-journey" element={<DiningJourneyPage />} />
      </Routes>
    </>
  );
}

export default App;
