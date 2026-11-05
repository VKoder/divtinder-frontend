import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { getErrorMessage } from "@/utils/helpers";
import logoImg from "@/assets/Logo.png";

function LoginPage() {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error } = useLogin();
  const errorMessage = getErrorMessage(error);

  function handleSubmit(event) {
    event.preventDefault();
    login({ emailId, password });
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 overflow-hidden bg-gradient-to-br from-[#FF3D9A] via-[#b5005e] to-[#FF786F] text-white select-none">
      {/* Ambient Glow Elements */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-pink-200/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-orange-200/15 blur-3xl pointer-events-none"
      />

      {/* Header & Brand Mark */}
      <header className="relative z-10 flex flex-col items-center text-center mt-2 mb-6 w-full max-w-sm md:max-w-md">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/10 border border-white/20 p-2.5">
            <img src={logoImg} alt="devBumble Logo" className="w-full h-full object-contain drop-shadow" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm font-['Sora',sans-serif]">
          devBumble
        </h1>
        <p className="text-sm md:text-base font-medium text-white/90 mt-1">
          Ignite meaningful connections.
        </p>
      </header>

      {/* Translucent Auth Card Container */}
      <div className="relative z-10 w-full max-w-sm md:max-w-md bg-white/15 backdrop-blur-xl rounded-3xl p-6 sm:p-7 md:p-9 shadow-2xl shadow-black/20 border border-white/20">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input Field */}
          <div className="flex flex-col text-left">
            <label
              className="text-xs font-semibold uppercase tracking-wider text-white/95 mb-1.5 ml-1"
              htmlFor="emailId"
            >
              Email address
            </label>
            <div className="relative flex items-center bg-white/95 rounded-full focus-within:bg-white focus-within:ring-2 focus-within:ring-white/80 transition-all duration-200">
              <Mail
                aria-hidden="true"
                className="absolute left-4 text-neutral-500 w-5 h-5 pointer-events-none"
              />
              <input
                autoComplete="email"
                className="w-full h-12 bg-transparent pl-11 pr-4 text-neutral-900 text-sm rounded-full focus:outline-none placeholder:text-neutral-400 font-medium"
                id="emailId"
                name="emailId"
                placeholder="you@domain.com"
                required
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col text-left">
            <label
              className="text-xs font-semibold uppercase tracking-wider text-white/95 mb-1.5 ml-1"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative flex items-center bg-white/95 rounded-full focus-within:bg-white focus-within:ring-2 focus-within:ring-white/80 transition-all duration-200">
              <Lock
                aria-hidden="true"
                className="absolute left-4 text-neutral-500 w-5 h-5 pointer-events-none"
              />
              <input
                autoComplete="current-password"
                className="w-full h-12 bg-transparent pl-11 pr-12 text-neutral-900 text-sm rounded-full focus:outline-none placeholder:text-neutral-400 font-medium"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 p-1 rounded-full text-neutral-500 hover:text-neutral-800 transition-colors focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              aria-live="polite"
              className="rounded-2xl bg-black/25 border border-red-300/40 px-3.5 py-2.5 text-xs font-medium text-red-100 backdrop-blur-md text-center"
            >
              {errorMessage}
            </div>
          )}

          {/* Primary Sign In Action */}
          <div className="pt-2">
            <button
              className="w-full h-[52px] rounded-full bg-white text-[#b5005e] font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-black/15 active:scale-[0.98] transition-all duration-150 hover:bg-pink-50 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              disabled={isPending}
              id="signin-btn"
              type="submit"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#b5005e]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 text-[#b5005e]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Legal Compliance Footer */}
      <footer className="relative z-10 mt-6 text-center max-w-xs md:max-w-sm">
        <p className="text-[11px] text-white/75 leading-relaxed">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-white">Terms of Service</span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>.
        </p>
      </footer>
    </div>
  );
}

export default LoginPage;
