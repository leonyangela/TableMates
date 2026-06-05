import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Link, useNavigate } from "react-router";

import Footer from "../../components/footer/footer.component";
import SubmitBtn from "../../components/button/submit-btn.component";

import SignUpBg from "../../assets/Images/sign-up-bg.jpg";
import Logo from "../../components/logo/logo.component";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, error } = useAuthStore();

  const { setError } = useAuthStore.getState();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(form.password)) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number.",
      );
      return;
    }

    await login(form.email, form.password);

    // redirect after successful login
    const { isLogin } = useAuthStore.getState();

    if (isLogin) {
      navigate("/");
    }
  };

  const signUpOnClick = () => {
    navigate("/sign-up");
    setError(null);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      {/* LEFT IMAGE */}
      <div
        className="w-3/5 bg-cover bg-center h-full"
        style={{ backgroundImage: `url(${SignUpBg})` }}
      />

      {/* RIGHT FORM */}
      <div className="w-2/5 px-14 py-6 flex flex-col">
        <div className="w-full flex items-center justify-between">
          <Logo />

          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-primary transition-all duration-200 flex items-center gap-1"
          >
            <ArrowBackIcon fontSize="small" />
            Back to Home
          </Link>
        </div>

        <div className="h-full justify-center flex items-center">
          <form
            onSubmit={handleSubmit}
            className="border p-6 rounded-lg space-y-4 mt-4"
          >
            <h1 className="text-center text-2xl font-semibold">
              Login to Your Account
            </h1>

            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            {/* ERROR MESSAGE */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <SubmitBtn
              text="Login"
              onClick={handleSubmit}
              className="bg-accent! text-white hover:bg-info! hover:border-transparent hover:text-white w-full text-center"
            />

            <p className="text-center text-sm mt-2">Don't have an account?</p>

            <SubmitBtn
              text="Sign Up"
              onClick={signUpOnClick}
              className="w-full text-center"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
