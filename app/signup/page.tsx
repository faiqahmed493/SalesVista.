"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { SalesVistaLogo } from "@/components/common/BrandLogo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8F9FA",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "48px",
        }}
      >
        {/* Left Side: Brand Logo, Title, Description, Features */}
        <div style={{ flex: 1, minWidth: "300px", maxWidth: "440px" }}>
          <SalesVistaLogo fontSize={48} style={{ marginBottom: "28px" }} />

          <h1
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 16px 0",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Create your account
          </h1>

          <p
            style={{
              fontSize: "15px",
              color: "#64748B",
              margin: "0 0 32px 0",
              lineHeight: 1.6,
            }}
          >
            Start analyzing your sales performance with AI insights, interactive charts, and custom dashboards.
          </p>

          {/* Feature Highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FFEDD5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F97316",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                Real-time interactive sales analytics & KPIs
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FFEDD5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F97316",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                AI assistant text-to-SQL query pipeline
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FFEDD5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F97316",
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                Custom insights canvas & saved reports
              </span>
            </div>
          </div>

          <p style={{ fontSize: "14px", color: "#64748B", margin: 0 }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#F97316",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Right Side: Form Card */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            maxWidth: "440px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            padding: "36px 32px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 45px -15px rgba(15, 23, 42, 0.08)",
            boxSizing: "border-box",
          }}
        >
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "#DC2626",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "14px",
                    color: "#0F172A",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.backgroundColor = "#FFFFFF";
                    e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.backgroundColor = "#F8FAFC";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "14px",
                    color: "#0F172A",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.backgroundColor = "#FFFFFF";
                    e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.backgroundColor = "#F8FAFC";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 42px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "14px",
                    color: "#0F172A",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.backgroundColor = "#FFFFFF";
                    e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.backgroundColor = "#F8FAFC";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94A3B8",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94A3B8",
                  }}
                />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    fontSize: "14px",
                    color: "#0F172A",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#F97316";
                    e.target.style.backgroundColor = "#FFFFFF";
                    e.target.style.boxShadow = "0 0 0 3px rgba(249, 115, 22, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E2E8F0";
                    e.target.style.backgroundColor = "#F8FAFC";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "13px 20px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                opacity: loading ? 0.8 : 1,
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(249, 115, 22, 0.35)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(249, 115, 22, 0.25)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
