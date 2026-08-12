"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  adminLoginAction,
  type AdminLoginState,
} from "@/app/actions/admin";

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, formAction, pending] =
    useActionState(
      adminLoginAction,
      initialState
    );

  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <form
      action={formAction}
      className="admin-login-form"
      autoComplete="off"
    >
      <div className="admin-login-field">
        <div className="admin-login-field-heading">
          <label htmlFor="password">
            Password Admin
          </label>

          <span>01</span>
        </div>

        <div className="admin-login-input-wrap">
          <input
            id="password"
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Masukkan password admin"
            autoComplete="new-password"
            required
          />

          <button
            type="button"
            className="admin-password-toggle"
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            aria-label={
              showPassword
                ? "Sembunyikan password"
                : "Lihat password"
            }
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c5.5 0 9 5 9 8a10.7 10.7 0 0 1-2.1 3.6" />
                <path d="M6.6 6.6C4.3 8 3 10.2 3 12c0 3 3.5 8 9 8a10.5 10.5 0 0 0 4-.8" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {state.error ? (
        <div
          className="admin-login-error"
          role="alert"
        >
          <span aria-hidden="true">!</span>

          <p>{state.error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        className="admin-login-submit"
        disabled={pending}
      >
        <span>
          {pending
            ? "Memeriksa..."
            : "Masuk Panel Admin"}
        </span>

        <span
          className="admin-login-submit-arrow"
          aria-hidden="true"
        >
          →
        </span>
      </button>
    </form>
  );
}