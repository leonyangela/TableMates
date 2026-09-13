import Footer from "../footer/footer.component";
import Navbar from "../navbar/navbar.component";

const MAX_WIDTH = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

const PADDING_X = {
  none: "px-0",
  sm: "px-4",
  md: "px-6 md:px-10",
  lg: "px-6 md:px-16",
};

const PADDING_Y = {
  none: "pb-0",
  sm: "pb-4",
  md: "pb-6 md:pb-10",
  lg: "pb-6 md:pb-16",
};

export default function WrapperComponent({
  children,
  maxWidth = "full",
  paddingX = "none",
  paddingY = "lg",
  className = "",
}) {
  return (
    <>
      <Navbar />
      <div
        className={`relative mx-auto w-full ${MAX_WIDTH[maxWidth]} ${PADDING_X[paddingX]} ${PADDING_Y[paddingY]} ${className}`}
      >
        {children}
      </div>
      <Footer />
    </>
  );
}
