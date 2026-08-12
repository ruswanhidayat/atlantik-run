"use client";

import { useActionState } from "react";

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
            type="password"
            placeholder="Masukkan password admin"
            autoComplete="new-password"
            required
          />

          <span
            className="admin-login-input-icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24">
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
              />

              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
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