"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginState,
} from "@/app/actions/auth";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="login-form-v2"
      autoComplete="off"
    >
      <div className="login-field">
        <label htmlFor="nip">NIP</label>

        <div className="login-input-wrap">
          <input
            id="nip"
            name="nip"
            type="text"
            inputMode="numeric"
            maxLength={9}
            placeholder="Masukkan NIP 9 digit"
            autoComplete="off"
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="login-form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="login-submit"
        type="submit"
        disabled={pending}
      >
        <span>{pending ? "Memeriksa..." : "Masuk"}</span>

        <span className="login-submit-arrow" aria-hidden="true">
          →
        </span>
      </button>

      <p className="login-helper">
        Gunakan NIP yang telah terdaftar sebagai peserta
        ATLANTIK RUN.
      </p>
    </form>
  );
}