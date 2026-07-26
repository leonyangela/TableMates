import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import SubmitBtn from "../button/submit-btn.component";
import Logo from "../logo/logo.component";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLogin, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  const navbarItem = [
    { title: "Home", path: "/", auth: "all" },
    { title: "Discover", path: "/discover", auth: "all" },
    { title: "Restaurants", path: "/restaurant", auth: "all" },
    { title: "Login", path: "/login", auth: "guest" },
    { title: "Sign Up", path: "/sign-up", auth: "guest" },
    { title: "Dining Journey", path: "/dining-journey", auth: "user" },
    {title: "Community Dining", path: "/community-dining", auth: "user"},
  ];

  const navLinks = navbarItem.filter((item) => {
    if (item.auth === "guest") return !isLogin;
    if (item.auth === "user") return isLogin;
    return true;
  });

  const links = navLinks.filter(
    (item) => item.auth === "all" || item.auth === "user",
  );

  const authButtons = navLinks.filter((item) => item.auth === "guest");

  const closeMenu = () => setMenuOpen(false);

  const handleNavigate = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  // Close menu when clicking/tapping outside the navbar
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div ref={navRef} className="relative px-4 sm:px-6 py-4">
      <div className="flex flex-row justify-between items-center">
        <Logo />

        {/* Desktop / tablet nav */}
        <div className="hidden md:flex flex-row justify-center items-center gap-4 lg:gap-6">
          {links.map((item) => (
            <Link
              key={item.title}
              className="text-center duration-200 transition-all ease-in-out hover:scale-105 hover:text-primary lg:mr-4"
              to={item.path}
            >
              {item.title}
            </Link>
          ))}

          <div className="flex flex-row justify-center items-center gap-2">
            {!isLogin ? (
              authButtons.map((item) => (
                <SubmitBtn
                  key={item.title}
                  text={item.title}
                  className={
                    item.title === "Sign Up"
                      ? "border-2 border-info bg-info text-white hover:text-primary! hover:border-primary! hover:bg-white"
                      : "border-2"
                  }
                  onClick={() => navigate(item.path)}
                />
              ))
            ) : (
              <SubmitBtn text="Logout" className="border-2" onClick={logout} />
            )}
          </div>
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="hover:cursor-pointer md:hidden relative inline-flex items-center justify-center w-10 h-10 z-50"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
              menuOpen ? "rotate-45" : "-translate-y-2"
            }`}
          />
          <span
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ease-in-out ${
              menuOpen ? "-rotate-45" : "translate-y-2"
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`md:hidden absolute left-0 right-0 top-full bg-white border-t shadow-lg z-40 overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-112 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-4 sm:px-6 py-4">
          {links.map((item, index) => (
            <Link
              key={item.title}
              className={`text-lg duration-200 transition-all ease-in-out hover:text-primary hover:translate-x-1 ${
                menuOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-1"
              }`}
              style={{ transitionDelay: menuOpen ? `${index * 50}ms` : "0ms" }}
              to={item.path}
              onClick={closeMenu}
            >
              {item.title}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-2 border-t">
            {!isLogin ? (
              authButtons.map((item, index) => (
                <SubmitBtn
                  key={item.title}
                  text={item.title}
                  className={`w-full border-2 transition-all duration-200 ease-in-out ${
                    item.title === "Sign Up"
                      ? "border-info bg-info text-white hover:text-primary! hover:border-primary! hover:bg-white"
                      : ""
                  } ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
                  style={{
                    transitionDelay: menuOpen
                      ? `${(links.length + index) * 50}ms`
                      : "0ms",
                  }}
                  onClick={() => handleNavigate(item.path)}
                />
              ))
            ) : (
              <SubmitBtn
                text="Logout"
                className={`p-0! text-black! hover:text-primary! lg:text-accent border-0! lg:border-2 w-full transition-all duration-200 ease-in-out hover:translate-x-1 lg:hover:translate-x-0 ${
                  menuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${links.length * 50}ms` : "0ms",
                }}
                onClick={handleLogout}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
