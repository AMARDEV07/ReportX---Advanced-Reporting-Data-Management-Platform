import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLoginForm } from "../../shared/utils/validation";
import { showToast } from "../../shared/utils/toast";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const Login = () => {
  const [formData, setFormData] = useState({
    emailUsername: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();





  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Clear form
  const clearForm = () => {
    setFormData({
      emailUsername: "",
      password: "",
    });
  };




  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validate form data
    const errors = validateLoginForm({ userRef: formData.emailUsername, password: formData.password });

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showToast("error", firstError);
      return;
    }

    // 2. Authenticate with Hardcoded Data
    if (
      formData.emailUsername !== "amarde@vimanotech.com" ||
      formData.password !== "aman123"
    ) {
      showToast("error", "Invalid credentials (amarde@vimanotech.com / aman123)");
      return;
    }

    setIsLoggingIn(true);

    const mockUser = {
      name: "Admin User",
      username: "admin",
      role: "admin",
    };

    // 3. Perform Login
    setTimeout(() => {
      login(mockUser);
      showToast("success", `Welcome ${mockUser.name}!`);
      clearForm();
      navigate("/Login/admin/dashboard");
      setIsLoggingIn(false);
    }, 1500); // Simulate network delay for the loader
  };

  return (
    <div className="position-relative">
      {isLoggingIn && <Loader fullScreen text="Authenticating..." />}
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner py-6 mx-4">
          <div className="card p-sm-7 p-2">
            {/* Logo */}
            <div className="app-brand justify-content-center mt-5">
              <a href="/" className="app-brand-link gap-3">
                <img
                  src="/assets/img/logo.png"
                  alt="Vizora Logo"
                  style={{ width: "200px" }}
                />
              </a>
            </div>

            <div className="card-body mt-1">
              <h4 className="mb-1">Welcome Admin</h4>
              <p className="mb-5">Please sign-in to your account</p>

              {/* <div className="alert alert-primary mb-5" role="alert">
                <div className="d-flex">
                  <i className="ri-information-line ri-24px me-2"></i>
                  <div>
                    <h6 className="alert-heading mb-1">Dummy Credentials:</h6>
                    <span>Username: <strong>admin</strong> | Password: <strong>password123</strong></span>
                  </div>
                </div>
              </div> */}

              <form
                id="formAuthentication"
                className="mb-5"
                onSubmit={handleSubmit}
              >
                {/* Email or Username */}
                <div className="form-floating form-floating-outline mb-5">
                  <input
                    type="text"
                    className="form-control"
                    id="emailUsername"
                    name="emailUsername"
                    placeholder="Enter your email or username"
                    autoFocus
                    value={formData.emailUsername}
                    onChange={handleChange}
                  />
                  <label htmlFor="emailUsername">Email or Username</label>
                </div>

                {/* Password */}
                <div className="mb-5">
                  <div className="form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          type="password"
                          id="password"
                          className="form-control"
                          name="password"
                          placeholder="············"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <label htmlFor="password">Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer">
                        <i className="ri-eye-off-line"></i>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mb-5">
                  <button
                    className="btn d-grid w-100 text-white"
                    type="submit"
                    style={{
                      backgroundColor: '#7367F0',
                      borderColor: '#7367F0',
                      boxShadow: '0 0.125rem 0.25rem 0 rgba(115, 103, 240, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#6459dd';
                      e.currentTarget.style.borderColor = '#6459dd';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#7367F0';
                      e.currentTarget.style.borderColor = '#7367F0';
                    }}
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
