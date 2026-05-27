import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuthStore } from "../../store/useAuthStore";

import Logo from "../../components/logo/logo.component";
import SubmitBtn from "../../components/button/submit-btn.component";

import SignUpBg from "../../assets/Images/sign-up-bg.jpg";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, error, setError, clearError, isLogin } = useAuthStore();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { displayName, email, password, confirmPassword } = form;

    // 1. Check empty fields first
    if (!displayName || !email || !password || !confirmPassword) {
      setError("Please input any empty fields.");
      return;
    }

    // 2. Name validation
    if (displayName.trim().length < 1) {
      setError("Name is required.");
      return;
    }

    // 3. Email validation (format)
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 4. Password rule
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include 1 uppercase letter and 1 number.",
      );
      return;
    }

    // 5. Confirm password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 6. Success → login
    const userData = {
      email,
      password,
      displayName,
    };

    setError(null);
    signup(userData);
    console.log(userData);
  };

  useEffect(() => {
    if (isLogin) {
      navigate("/");
    }
  }, [isLogin]);

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
            Create an Account
          </h1>

          <input
            type="text"
            name="displayName"
            placeholder="Name"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />

          {/* ERROR MESSAGE */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <SubmitBtn text="Sign Up" onClick={handleSubmit} />

          <p className="text-center text-sm mt-2">Have an account?</p>

          <SubmitBtn text="Login" onClick={() => navigate("/login")} />
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
