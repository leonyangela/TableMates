import Footer from "../footer/footer.component";
import Navbar from "../navbar/navbar.component";

const WrapperComponent = ({ children }) => {
  return (
    <div className="w-full h-auto max-w-480 mx-auto relative">
      <Navbar />
      <div className="py-0 p-4 w-full h-full">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default WrapperComponent;
