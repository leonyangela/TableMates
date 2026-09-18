import SeedRestaurantsButton from "@/components/admin/seeds-button.component";
import Hero from "@/components/hero/hero.component";
import Navbar from "@/components/navbar/navbar.component";

const CommunityDining = () => {
  return (
    <div className="relative">
      <Navbar />

      <div className="w-screen h-auto p-4 pt-0">This is a community dining page</div>
      {/* <SeedRestaurantsButton /> */}
      {/* useBookingStore.getState().setPendingEdit({ editBooking, highlightLocationId }); */}
{/* router.push("/restaurants"); */}
    </div>
  );
};

export default CommunityDining;
