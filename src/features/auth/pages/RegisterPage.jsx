import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import {
  asyncSetIsAuthRegister,
  setIsAuthRegisterActionCreator,
} from "../states/action";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthRegister = useSelector((state) => state.isAuthRegister);

  const [name, onNameChange] = useInput("");
  const [email, onEmailChange] = useInput("");
  const [password, onPasswordChange] = useInput("");
  const [confirmPassword, onConfirmPasswordChange] = useInput("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthRegister) {
      dispatch(setIsAuthRegisterActionCreator(false));
      navigate("/auth/login");
    }
  }, [isAuthRegister, dispatch, navigate]);

  function validate() {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }
    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi";
    }
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak sama";
    }
    return newErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    dispatch(asyncSetIsAuthRegister(name, email, password));
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

  return (
    <div>
      <h2 className="text-2xl font-bold">Daftar</h2>
      <p className="mt-1 text-slate-500">Buat akun baru untuk memulai.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nama
          </label>
          <input id="name" type="text" value={name} onChange={onNameChange} className={inputClass} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={onEmailChange} className={inputClass} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Kata sandi
          </label>
          <input id="password" type="password" value={password} onChange={onPasswordChange} className={inputClass} />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Konfirmasi kata sandi
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          Daftar
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link to="/auth/login" className="font-semibold text-indigo-600">
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;