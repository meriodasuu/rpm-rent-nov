"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return <form action={action} className="stack"><div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="username" required /></div><div className="field"><label htmlFor="password">Пароль</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required /></div>{state.error ? <p className="field-error" role="alert">{state.error}</p> : null}<button className="button red" type="submit" disabled={pending}>{pending ? "Проверяем…" : "Войти"}</button></form>;
}
