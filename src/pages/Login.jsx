import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useLoginMutation } from "../store/api/authApiSlice";
import { setCredentials, selectCurrentToken } from "../store/slices/authSlice";
import useTheme from "../hooks/useTheme";

const loginSchema = z.object({
  identifier: z.string().min(3, { message: "Username atau email harus diisi" }),
  password: z.string().min(6, { message: "Password minimal harus 6 karakter" }),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();

  const [login, { isLoading }] = useLoginMutation();
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    try {
      const userData = await login(data).unwrap();
      dispatch(setCredentials(userData));
      toast.success("Login berhasil!");
      navigate("/");
    } catch (err) {
      const errorMessage =
        err.data?.message || "Login gagal. Periksa kembali kredensial Anda.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen bg-base-100 overflow-hidden">
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost bg-base-100/80 backdrop-blur-sm border border-base-300 shadow-lg"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <img
              src="/images/LIGHT MODE.svg"
              alt="Switch to Dark Mode"
              className="h-5 w-5"
            />
          ) : (
            <img
              src="/images/DARK MODE.svg"
              alt="Switch to Light Mode"
              className="h-5 w-5"
            />
          )}
        </button>
      </div>

      {/* Mobile Background with Enhanced Overlay */}
      <div className="lg:hidden absolute inset-0 z-0">
        <img
          src="/images/adminsignin.png"
          alt="Background"
          className="w-full h-full object-cover scale-110 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/85" />

        {/* Mobile Floating Elements */}
        <div className="absolute top-16 right-8 w-12 h-12 bg-brand-gold/20 rounded-full animate-bounce"></div>
        <div className="absolute top-32 left-6 w-8 h-8 bg-base-content/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-20 left-1/2 w-6 h-6 bg-yellow-400/30 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 lg:grid lg:grid-cols-2 min-h-screen">
        {/* LEFT SIDE - Desktop Image */}
        <div className="hidden lg:block relative h-full overflow-hidden">
          <img
            src="/images/adminsignin.png"
            alt="Gaming Atmosphere"
            className="w-full h-full object-cover"
          />

          {/* Desktop Floating Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-brand-gold/20 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-16 w-8 h-8 bg-base-content/30 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-32 left-20 w-12 h-12 bg-blue-400/20 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-60 left-1/2 w-6 h-6 bg-yellow-400/40 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Bottom overlay for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Desktop Content */}
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="mb-8">
              <div className="w-16 h-16 bg-brand-gold rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                Rental PS
                <span className="block text-brand-gold drop-shadow-lg">
                  Management
                </span>
              </h1>
              <p className="text-white text-base max-w-sm leading-relaxed drop-shadow-md">
                Platform terdepan untuk mengelola bisnis rental PlayStation Anda
                dengan efisien dan profesional
              </p>
            </div>

            <div className="flex space-x-6 text-white">
              <div className="bg-base-300/30 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <div className="text-xl font-bold text-brand-gold">500+</div>
                <div className="text-xs text-white/90">Transaksi</div>
              </div>
              <div className="bg-base-300/30 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <div className="text-xl font-bold text-brand-gold">24/7</div>
                <div className="text-xs text-white/90">Support</div>
              </div>
              <div className="bg-base-300/30 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                <div className="text-xl font-bold text-brand-gold">100%</div>
                <div className="text-xs text-white/90">Secure</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="flex flex-col min-h-screen lg:min-h-auto lg:h-auto">
          {/* Mobile Header */}
          <div className="lg:hidden pt-safe-top px-4 py-8 text-center">
            <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              Rental PS Management
            </h1>
            <p className="text-white/90 text-sm drop-shadow-md">
              Platform terdepan untuk mengelola bisnis rental PlayStation
            </p>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center px-4 py-6 lg:py-8">
            <div className="w-full max-w-md">
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-8">
                <h1 className="text-3xl font-bold text-base-content mb-2">
                  Welcome Back!
                </h1>
                <p className="text-base-content/70">
                  Silakan masuk untuk melanjutkan ke dashboard
                </p>
              </div>

              {/* Mobile Welcome Text */}
              <div className="lg:hidden text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                  Selamat Datang Kembali!
                </h2>
                <p className="text-white/80 text-sm drop-shadow-sm">
                  Masuk untuk melanjutkan ke dashboard
                </p>
              </div>

              {/* Login Form */}
              <div className="bg-base-100/95 lg:bg-base-100 rounded-2xl lg:rounded-2xl p-6 lg:p-8 shadow-xl lg:shadow-lg border-2 border-base-300 backdrop-blur-md">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5 lg:space-y-6"
                >
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      Username / Email
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan username"
                      {...register("identifier")}
                      className={`w-full px-4 py-3.5 lg:py-3 rounded-xl border-2 transition-all duration-200 text-base lg:text-sm bg-base-100 text-base-content ${errors.username
                        ? "border-error focus:border-error bg-error/10"
                        : "border-base-300 focus:border-brand-gold focus:bg-brand-gold/5"
                        } focus:outline-none focus:ring-2 focus:ring-brand-gold/20`}
                      disabled={isLoading}
                      autoComplete="username"
                      autoCapitalize="none"
                    />
                    {errors.username && (
                      <p className="text-error text-sm mt-1.5 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-base-content mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        {...register("password")}
                        className={`w-full px-4 py-3.5 lg:py-3 pr-12 rounded-xl border-2 transition-all duration-200 text-base lg:text-sm bg-base-100 text-base-content ${errors.password
                          ? "border-error focus:border-error bg-error/10"
                          : "border-base-300 focus:border-brand-gold focus:bg-brand-gold/5"
                          } focus:outline-none focus:ring-2 focus:ring-brand-gold/20`}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-base-200 rounded-lg transition-colors touch-manipulation"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-base-content/60" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-base-content/60" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-error text-sm mt-1.5 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-brand-gold hover:bg-amber-600 text-white font-medium py-4 lg:py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] shadow-lg hover:shadow-xl text-base lg:text-sm touch-manipulation"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Memproses...
                      </span>
                    ) : (
                      "Masuk ke Dashboard"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Footer Stats */}
          <div className="lg:hidden px-4 pb-safe-bottom py-6">
            <div className="flex justify-center space-x-4 text-white">
              <div className="bg-base-300/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/10">
                <div className="text-lg font-bold text-brand-gold">500+</div>
                <div className="text-xs text-white/90">Transaksi</div>
              </div>
              <div className="bg-base-300/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/10">
                <div className="text-lg font-bold text-brand-gold">24/7</div>
                <div className="text-xs text-white/90">Support</div>
              </div>
              <div className="bg-base-300/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center border border-white/10">
                <div className="text-lg font-bold text-brand-gold">100%</div>
                <div className="text-xs text-white/90">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
