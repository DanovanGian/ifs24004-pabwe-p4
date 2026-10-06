import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import useInput from "../../../hooks/useInput";
import { asyncSetIsAuthLogin } from "../states/action";

function LoginPage() {
  const dispatch = useDispatch();
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    }
    return newErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    dispatch(asyncSetIsAuthLogin(email, password));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Masuk</h1>
      <p className="mt-1 text-slate-500">Silakan masuk ke akunmu.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email-input" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="login-email-input"
            type="email"
            value={email}
            onChange={onEmailChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password-input" className="mb-1 block text-sm font-medium">
            Kata sandi
          </label>
          <input
            id="login-password-input"
            type="password"
            value={password}
            onChange={onPasswordChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          id="login-submit-button"
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Masuk
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="font-semibold text-indigo-600">
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;