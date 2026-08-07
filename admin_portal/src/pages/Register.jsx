import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    role: "resident",
    password: "",
    confirm_password: "",
    flat: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    if (formData.password !== formData.confirm_password) {
      setMessage("❌ Passwords do not match");
      return;
    }

    if (formData.role === "resident" && !formData.flat) {
      setMessage("❌ Flat number is required for residents");
      return;
    }

    const API_URL = "http://127.0.0.1:8000/api/auth/register/";

    console.log("Calling:", API_URL);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          phone_number: formData.phone_number,
          role: formData.role,
          flat: formData.role === "resident" ? Number(formData.flat) : null,
          password: formData.password,
          password2: formData.confirm_password,
        }),
      });

      const data = await response.json();

      console.log("Response:", data);

      if (response.ok) {
        setMessage("✅ Registration Successful! Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        const errorData = await response.json();
        const errorMsg = errorData?.detail || errorData?.email?.[0] || errorData?.password?.[0] || "Registration failed. Please check your details.";
        setMessage("❌ " + errorMsg);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Cannot connect to server");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone_number"
            placeholder="Enter phone number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>

          {formData.role === "resident" && (
            <input
              type="number"
              name="flat"
              placeholder="Flat Number"
              value={formData.flat}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              whiteSpace: "pre-wrap",
              color: message.includes("Successful") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}