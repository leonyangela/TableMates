import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import SubmitBtn from "../button/submit-btn.component";
import Logo from "../logo/logo.component";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLogin, logout } = useAuthStore();

  const navbarItem = [
    { title: "Home", path: "/", auth: "all" },
    { title: "Discover", path: "/discover", auth: "all" },
    { title: "Restaurants", path: "/restaurant", auth: "all" },
    {
      title: "Login",
      path: "/login",
      auth: "guest",
    },
    { title: "Sign Up", path: "/sign-up", auth: "guest" },
    { title: "Dining Journey", path: "/dining-journey", auth: "user"}
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

  return (
    <div className="flex flex-row justify-between px-6 py-4">
      <Logo />

      <div className="flex flex-row justify-center items-center gap-6">
        {links.map((item) => (
          <Link
            key={item.title}
            href={item.path}
            className="text-center duration-200 transition-all ease-in-out hover:scale-105 hover:text-primary mr-4"
            to={item.path}
          >
            {item.title}
          </Link>
        ))}

        {/* <div className="flex flex-row justify-center items-center gap-2">
          <SubmitBtn text={"Login"} className={"border-2"} />
          <SubmitBtn
            text={"Sign Up"}
            className={
              "border-2 border-secondary bg-secondary text-white hover:text-primary! hover:border-primary! hover:bg-white"
            }
          />
        </div> */}
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
    </div>
  );
};

export default Navbar;
