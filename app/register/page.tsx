"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main>
      <h1>Create account</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" minLength={8} required />
        <input name="confirmPassword" type="password" minLength={8} required />
        <button>Create account</button>
      </form>

      {error && <p>{error}</p>}

      <a href="/login">Already have an account?</a>
    </main>
  );
}