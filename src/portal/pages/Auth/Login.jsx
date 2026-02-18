import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "../../../shared/utils/toast";
import { API_BASE_URL } from "../../../shared/config/api";
import Loader from "../../components/Loader";
import { validateLoginForm } from "../../../shared/utils/validation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate first
    const validationErrors = validateLoginForm({ userRef: email, password });
    setErrors({
      email: validationErrors.userRef,
      password: validationErrors.password,
    });

    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== undefined,
    );

    if (hasErrors) {
      toast.error("Please fix the errors", {
        position: "top-right",
        duration: 2500,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success || data?.status_id !== 1) {
        toast.error(data?.message || "Invalid email or password!", {
          position: "top-right",
          duration: 3000,
        });
        return;
      }

      const record = data?.records;

      console.log("Login Response:", record);
      console.log("User Entities from Login:", record?.entity);

      sessionStorage.setItem("token", record?.token);

      const userObject = {
        user_id: record?.user_id,
        user_name: record?.user_name,
        email: record?.email,
        permission_entity: record?.permission_entity,
        entities: record?.entity || [],
      };

      console.log("Saving User Object:", userObject);

      sessionStorage.setItem("user", JSON.stringify(userObject));

      toast.success(`Welcome back, ${record?.user_name}!`, {
        position: "top-right",
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/entity-selection", { replace: true });
      }, 100);
    } catch (err) {
      console.error(err);

      toast.error("Something went wrong!", {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center font-sans p-4 relative">
      {loading && <Loader fullScreen text="Signing in..." />}

      <div className="bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-[450px] z-10">
        <div className="flex items-center justify-center mb-8">
          <img
            src="/assets/img/logo.png"
            alt="Vizora Logo"
          className="max-h-[60px] w-auto"

          />
        </div>

        <div className="mb-6">
          <h2 className="text-[24px] text-[#5D596C] mb-1">
            Welcome to Vizora!
          </h2>
          <p className="text-[#6F6B7D] text-[16px]">
            Sign in to continue and view your reports.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-[11px] text-[#5D596C] uppercase tracking-wider mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-[#DBDADE] focus:ring-[#7367F0]"
                }
              `}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
            />

            {errors.email ? (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            ) : null}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] text-[#5D596C] uppercase tracking-wider">
                Password
              </label>
              <a
                href="#"
                className="text-[13px] text-[#7367F0] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="············"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-[#DBDADE] focus:ring-[#7367F0]"
                  }
                `}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#A5A3AE] hover:text-[#7367F0]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password ? (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md font-medium transition-all
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7367F0] hover:bg-[#6459dd]"
              }
            `}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
