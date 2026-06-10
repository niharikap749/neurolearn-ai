import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {

      const response = await axios.post(
        "https://neurolearn-ai-6btb.onrender.com/register",
        formData
      );

      alert(response.data.message);

      navigate("/");

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.detail || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg bg-zinc-800"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded-lg bg-zinc-800"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-3 mb-6 rounded-lg bg-zinc-800"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-white text-black p-3 rounded-lg font-semibold"
        >
          Register
        </button>

      </div>

    </div>
  );
}

export default Register;