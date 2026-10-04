"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { IoLogoDribbble } from "react-icons/io";
import { FiCheckCircle } from "react-icons/fi";

function AuthPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [emailForOTP, setEmailForOTP] = useState("");
    const [lastPath, setLastPath] = useState("/");
    const [canResendOTP, setCanResendOTP] = useState(true);
    const [resendTimeout, setResendTimeout] = useState(0);
    const otpInputRefs = useRef([]);
    const modalRef = useRef(null);

    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const [usernameValidation, setUsernameValidation] = useState({
        isValid: true,
        message: "",
        length: false,
        alphanumeric: false
    });

    const formVariants = {
        hidden: { opacity: 0, x: isSignUp ? 50 : -50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: isSignUp ? -50 : 50 }
    };

    useEffect(() => {
        const initialMode = searchParams.get("mode") === "signup";
        setIsSignUp(initialMode);
        setLastPath(sessionStorage.getItem("lastPath") || "/");
    }, [searchParams]);

    useEffect(() => {
        const newUrl = `${window.location.pathname}?mode=${isSignUp ? "signup" : "signin"}`;
        if (window.location.search !== `?mode=${isSignUp ? "signup" : "signin"}`) {
            window.history.replaceState(null, "", newUrl);
        }
    }, [isSignUp]);

    useEffect(() => {
        if (isSignUp) {
            setPasswordStrength({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /[0-9]/.test(password),
                specialChar: /[^A-Za-z0-9]/.test(password)
            });
        }
    }, [password, isSignUp]);

    useEffect(() => {
        if (isSignUp && name) {
            const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name);
            const isValidLength = name.length >= 3 && name.length <= 20;

            setUsernameValidation({
                isValid: isAlphanumeric && isValidLength,
                message: !isAlphanumeric ? "Username can only contain letters (A-Z, a-z) and numbers (0-9). No special characters, spaces, or symbols allowed." : !isValidLength ? "Username must be between 3 and 20 characters" : "",
                length: isValidLength,
                alphanumeric: isAlphanumeric
            });
        } else {
            setUsernameValidation({
                isValid: true,
                message: "",
                length: false,
                alphanumeric: false
            });
        }
    }, [name, isSignUp]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5 && otpInputRefs.current[index + 1]) {
            otpInputRefs.current[index + 1].focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text/plain").trim();
        if (/^\d{6}$/.test(pasteData)) {
            const pasteArray = pasteData.split("");
            setOtp(pasteArray.slice(0, 6));
        }
    };

    useEffect(() => {
        if (otp.join("").length === 6) {
            verifyOTP();
        }
    }, [otp, isOTPModalOpen]);


    useEffect(() => {
        let timer;
        if (resendTimeout > 0) {
            timer = setInterval(() => {
                setResendTimeout(prev => prev - 1);
            }, 1000);
        } else if (resendTimeout === 0 && !canResendOTP) {
            setCanResendOTP(true);
        }
        return () => clearInterval(timer);
    }, [resendTimeout, canResendOTP]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                event.stopPropagation();
            }
        };

        if (isOTPModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOTPModalOpen]);

    const toggleAuthMode = () => {
        setIsSignUp(prev => !prev);
        setError("");
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleGoogleAuth = () => {
        setError("");
        setIsGoogleLoading(true);

        const nextPath = encodeURIComponent(lastPath || "/");
        window.location.href = `/api/auth/google/start?next=${nextPath}`;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateInputs()) return;

        setIsLoading(true);

        try {
            if (isSignUp) {
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: name,
                        email,
                        password
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message);
                }

                setEmailForOTP(email);
                setIsOTPModalOpen(true);
                setCanResendOTP(false);
                setResendTimeout(30);
            } else {
                const response = await fetch("/api/auth/signin", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Login failed");
                }

                const data = await response.json();

                document.cookie = `accessToken=Bearer ${data.accessToken}; path=/; secure; samesite=lax`;
                document.cookie = `refreshToken=${data.refreshToken}; path=/auth/refresh; secure; samesite=lax`;
                document.cookie = `docspost-auth=signed-in; path=/; secure; samesite=lax`;
                localStorage.setItem("docspost-auth", "signed-in");
                // Store username and email for profile display
                if (data.user && data.user.username) {
                    localStorage.setItem("docspost-username", data.user.username);
                } else if (data.user && data.user.email) {
                    localStorage.setItem("docspost-username", data.user.email.split("@")[0]);
                }
                if (data.user && data.user.email) {
                    localStorage.setItem("docspost-email", data.user.email);
                } else {
                    localStorage.setItem("docspost-email", email);
                }

                router.replace(lastPath);
            }
        } catch (err) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async () => {
        setError("");
        setIsLoading(true);

        try {
            const otpString = otp.join("");
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailForOTP.trim(),
                    otp: otpString.trim()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Verification failed");
            }

            if (isSignUp) {
                const data = await response.json();
                const accessToken = data.accessToken.toString("hex");

                document.cookie = `accessToken=Bearer ${(accessToken)}; path=/; secure; samesite=lax`;
                document.cookie = `refreshToken=${data.refreshToken}; path=/auth/refresh; secure; samesite=lax`;
                document.cookie = `docspost-auth=signed-in; path=/; secure; samesite=lax`;
                localStorage.setItem("docspost-auth", "signed-in");
                // Store username and email for profile display
                if (data.user && data.user.username) {
                    localStorage.setItem("docspost-username", data.user.username);
                } else if (name) {
                    localStorage.setItem("docspost-username", name);
                }
                // Always save the email
                localStorage.setItem("docspost-email", emailForOTP);

                sessionStorage.setItem("showWelcome", "true");
            }

            router.replace(lastPath);
        } catch (err) {
            setError(err.message || "Verification failed. Please try again.");
            setOtp(["", "", "", "", "", ""]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResendOTP) return;

        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: emailForOTP }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(text.includes("<!DOCTYPE html>")
                    ? "Server error occurred"
                    : text);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to resend OTP");
            }

            setCanResendOTP(false);
            setResendTimeout(30);
            toast.success("New OTP sent successfully");

        } catch (err) {
            console.error("Resend error:", err);
            toast.error(err.message || "Failed to resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const validateInputs = () => {
        if (!email || !password) {
            setError("Email and password are required");
            return false;
        }

        if (isSignUp) {
            if (!name || name.length < 3) {
                setError("Username must be at least 3 characters");
                return false;
            }

            // Validate username format: only alphanumeric characters
            if (!/^[a-zA-Z0-9]+$/.test(name)) {
                setError("Username can only contain letters (A-Z, a-z) and numbers (0-9). No special characters, spaces, or symbols allowed.");
                return false;
            }

            if (name.length > 20) {
                setError("Username must not exceed 20 characters");
                return false;
            }

            if (password.length < 8) {
                setError("Password must be at least 8 characters");
                return false;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return false;
        }

        return true;
    };


    const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
            {/* Left Brand Showcase Column */}
            <div className="md:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
                <div>
                    <Link href="/" className="inline-flex items-center gap-3 text-white mb-16">
                        <span className="text-blue-500">
                            <IoLogoDribbble size={36} />
                        </span>
                        <span className="text-2xl font-bold tracking-tight">DocsPost</span>
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-8">
                        Share knowledge.
                        <br />
                        Build your profile.
                        <br />
                        <span className="text-blue-400">Learn together.</span>
                    </h1>

                    <div className="space-y-4 max-w-md">
                        <div className="flex items-center gap-3 text-slate-300">
                            <span className="text-blue-400 flex-shrink-0">
                                <FiCheckCircle size={20} />
                            </span>
                            <span className="text-base font-medium">Join a growing community</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <span className="text-blue-400 flex-shrink-0">
                                <FiCheckCircle size={20} />
                            </span>
                            <span className="text-base font-medium">Write and publish documents</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <span className="text-blue-400 flex-shrink-0">
                                <FiCheckCircle size={20} />
                            </span>
                            <span className="text-base font-medium">Learn from experts</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <span className="text-blue-400 flex-shrink-0">
                                <FiCheckCircle size={20} />
                            </span>
                            <span className="text-base font-medium">Track your progress</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-sm text-slate-400">
                    © {new Date().getFullYear()} DocsPost. Built for developers & creators.
                </div>
            </div>

            {/* Right Auth Form Column */}
            <div className="md:w-1/2 bg-slate-900 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isSignUp ? "Create an account" : "Welcome back"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isSignUp ? "Join the developer platform today" : "Sign in to your account"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="your_username"
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                {isSignUp ? "Email Address" : "Email or Username"}
                            </label>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@example.com"
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                {!isSignUp && (
                                    <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">or continue with</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={isGoogleLoading}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-3 transition cursor-pointer"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#EA4335" d="M12 11.2v3.9h5.5c-.2 1.1-.9 2.5-2.1 3.4l3.2 2.5c1.8-1.7 2.9-4.2 2.9-7.1 0-.7-.1-1.3-.2-1.9H12z" />
                            <path fill="#34A853" d="M6.6 14.3l-.7.5-2.4 1.8C5 19.6 8.2 22 12 22c2.6 0 4.8-.9 6.4-2.5l-3.2-2.5c-.9.6-2 .9-3.2.9-2.4 0-4.4-1.6-5.1-3.6z" />
                            <path fill="#FBBC05" d="M3.5 7.8A9.95 9.95 0 0 0 2 12c0 1.4.3 2.8.8 4l3.4-2.6c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.5 7.8z" />
                            <path fill="#4285F4" d="M12 4.1c1.5 0 2.8.5 3.8 1.4l2.8-2.8C16.8 1 14.6 0 12 0 8.2 0 5 2.4 3.5 5.8l3.4 2.6C7.6 6 9.6 4.1 12 4.1z" />
                        </svg>
                        <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
                    </button>

                    <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={toggleAuthMode}
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOTPModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-9999 overflow-y-auto flex items-center justify-center"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
                        <div className="relative z-10 w-full max-w-md p-4">
                            <motion.div
                                ref={modalRef}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-lg shadow-xl overflow-hidden"
                            >
                                <div className="px-6 py-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Verify Your Email
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        We&apos;ve sent a 6-digit code to <span className="font-semibold">{emailForOTP}</span>
                                    </p>

                                    <div className="mb-4">
                                        <div className="flex justify-center space-x-2">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => (otpInputRefs.current[index] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onPaste={handleOtpPaste}
                                                    onFocus={(e) => e.target.select()}
                                                    className="w-12 h-12 text-2xl text-center text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mb-4 text-sm text-red-600">{error}</div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={!canResendOTP || isLoading}
                                            className={`text-sm font-medium ${canResendOTP ? "text-indigo-600 hover:text-indigo-500" : "text-gray-400"}`}
                                        >
                                            {resendTimeout > 0 ? `Resend in ${resendTimeout}s` : "Resend Code"}
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOTPModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={verifyOTP}
                                        disabled={isLoading || otp.join("").length !== 6}
                                        className={`px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${(isLoading || otp.join("").length !== 6) ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        {isLoading ? "Verifying..." : "Verify"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        }>
            <AuthPageContent />
        </Suspense>
    );
}