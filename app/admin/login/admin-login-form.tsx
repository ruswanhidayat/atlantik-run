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
      className="login-form"
    >
      <div className="field">
        <label htmlFor="password">
          Password Admin
        </label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Masukkan password admin"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error ? (
        <p className="form-error">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
      >
        {pending
          ? "Memeriksa..."
          : "Masuk Panel Admin"}
      </button>
    </form>
  );
}