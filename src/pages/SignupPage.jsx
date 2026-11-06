import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useSignup } from "@/hooks/useSignup";
import { getErrorMessage } from "@/utils/helpers";
import logoImg from "@/assets/Logo.png";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signup, isPending, error } = useSignup();
  const errorMessage = getErrorMessage(error);

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      emailId: emailId.trim(),
      password,
    };
    if (age) {
      payload.age = Number(age);
    }
    if (gender) {
      payload.gender = gender;
    }
    signup(payload);
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-[#fff7fa] text-[#261626] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#b40066] selection:text-white">
      <div className="w-full max-w-[460px]">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 mb-3 group transition-transform active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#b40066] to-[#dd1d77] flex items-center justify-center p-2 shadow-md shadow-[#b40066]/20">
              <img
                src={logoImg}
                alt="devBumble Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-['Sora',sans-serif] text-2xl font-bold tracking-tight text-[#261626]">
              devBumble
            </span>
          </Link>
          <h1 className="font-['Sora',sans-serif] text-2xl font-bold text-[#261626]">
            Create your account
          </h1>
          <p className="text-sm text-[#6f5660] mt-1">
            Join the developer network. Swipe, connect, and collaborate.
          </p>
        </div>

        {/* Clean, high-contrast auth card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(40,10,30,0.06)] border border-[#e1bdc7]/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Fields (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-bold text-[#261626] block"
                  htmlFor="firstName"
                >
                  First name *
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#8d6f78] pointer-events-none" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] placeholder:text-[#8d6f78]/70 focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-bold text-[#261626] block"
                  htmlFor="lastName"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] placeholder:text-[#8d6f78]/70 focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label
                className="text-xs font-bold text-[#261626] block"
                htmlFor="signup-email"
              >
                Email address *
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-[#8d6f78] pointer-events-none" />
                <input
                  id="signup-email"
                  name="emailId"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] placeholder:text-[#8d6f78]/70 focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label
                className="text-xs font-bold text-[#261626] block"
                htmlFor="signup-password"
              >
                Password *
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#8d6f78] pointer-events-none" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] placeholder:text-[#8d6f78]/70 focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 p-1 rounded-lg text-[#8d6f78] hover:text-[#261626] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Age & Gender (Optional / Quick setup) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-bold text-[#261626] block"
                  htmlFor="signup-age"
                >
                  Age (18+)
                </label>
                <input
                  id="signup-age"
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="24"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] placeholder:text-[#8d6f78]/70 focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  className="text-xs font-bold text-[#261626] block"
                  htmlFor="signup-gender"
                >
                  Gender
                </label>
                <select
                  id="signup-gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#e1bdc7]/60 bg-[#fff7fa]/50 text-sm text-[#261626] focus:outline-none focus:border-[#b40066] focus:bg-white focus:ring-2 focus:ring-[#b40066]/15 transition-all cursor-pointer"
                >
                  <option value="male">Man</option>
                  <option value="female">Woman</option>
                  <option value="others">Other</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 p-3 text-xs font-medium text-[#ba1a1a] text-center"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#b40066] to-[#dd1d77] hover:opacity-95 text-white font-['Sora',sans-serif] font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#b40066]/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-5 pt-4 border-t border-[#e1bdc7]/30 text-center text-xs text-[#6f5660]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#b40066] hover:underline underline-offset-2 ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#8d6f78]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#008561]" />
          <span>Strictly 18+ Developer Network • Safe & Secure</span>
        </div>
      </div>
    </div>
  );
}

