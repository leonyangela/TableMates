import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router";

import Navbar from "../../components/navbar/navbar.component";
import Footer from "../../components/footer/footer.component";
import SubmitBtn from "../../components/button/submit-btn.component";

import SignUpBg from "../../assets/Images/sign-up-bg.jpg";
import Logo from "../../components/logo/logo.component";

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, error } = useAuthStore();

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

    const { setError, error } = useAuthStore.getState();

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

    if(error.toLowerCase().includes("auth/user-not-found")) {
      setError("No account found with this email. Please sign up first.");
      return;
    } else if (error.toLowerCase().includes("auth/invalid-credential")) {
      setError("Make sure your email and password are correct. Please try again.");
      return;
    } else if (error.toLowerCase().includes("auth/too-many-requests")) {
      setError("Too many login attempts. Please try again later.");
      return;
    }
    

    await login(form.email, form.password);

    // redirect after successful login
    const { isLogin } = useAuthStore.getState();

    if (isLogin) {
      navigate("/");
    }
  };

  return (
    <div className="grid grid-cols-2 w-screen h-screen overflow-hidden">
      {/* LEFT IMAGE */}
      <div
        className="bg-cover bg-center w-full h-full"
        style={{ backgroundImage: `url(${SignUpBg})` }}
      />

      {/* RIGHT FORM */}
      <div className="p-6 flex flex-col justify-center">
        <Logo />

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

          <SubmitBtn text="Login" onClick={handleSubmit} className="w-full text-center" />

          <p className="text-center text-sm mt-2">Don't have an account?</p>

          <SubmitBtn text="Sign Up" onClick={() => navigate("/sign-up")} className="w-full text-center" />

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
