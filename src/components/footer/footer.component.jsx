import "./footer.styles.css";

import { useNavigate } from "react-router";

import SubmitBtn from "../button/submit-btn.component";
import Logo from "../logo/logo.component";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="footer gap-2 p-10">
      <div className="w-1/3 justify-between">
        <Logo />
        <h1 className="pt-2">
          &#169; 2026 All rights reserved. Helping you find and book great
          dining experiences, effortlessly.
        </h1>
      </div>
      <div className="w-1/3 ">
        <h1 className="font-bold">Book with confidence</h1>
        <h1>
          Discover restaurants, check availability in real time, and reserve
          your table in seconds.
        </h1>

        <h1 className="pt-8 pb-2 font-bold">
          Ready to dine? Find your table now.
        </h1>
        <SubmitBtn
          text={"Find a Table"}
          className={`text-base text-white border-white transition-all duration-200 ease-out hover:bg-gray-200!`}
          onClick={() => navigate("/discover")}
        ></SubmitBtn>
      </div>
      <div className="w-1/3 text-right">
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          Home
        </h1>
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          How It Works
        </h1>
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          FAQ
        </h1>
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          Contact
        </h1>
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          Privacy Policy
        </h1>
        <h1 className="hover:font-bold cursor-pointer transition-all duration-100 ease-in-out">
          Terms & Conditions
        </h1>
      </div>
    </div>
  );
};

export default Footer;
