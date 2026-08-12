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
      className="login-form"
      autoComplete="off"
    >
      <div className="field">
        <label htmlFor="nip">NIP</label>

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

      {state.error ? (
        <p className="form-error">{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}