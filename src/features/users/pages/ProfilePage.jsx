import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { getImageUrl } from "../../../helpers/toolsHelper";
import {
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePhoto,
  asyncSetIsChangeProfilePassword,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
} from "../states/action";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";
const buttonClass =
  "rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700";

function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const isChangeProfilePhoto = useSelector(
    (state) => state.isChangeProfilePhoto
  );
  const isChangeProfilePassword = useSelector(
    (state) => state.isChangeProfilePassword
  );

  const [name, onNameChange] = useInput(profile.name);
  const [email, onEmailChange] = useInput(profile.email);
  const [password, onPasswordChange, setPassword] = useInput("");
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput("");
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (isChangeProfilePhoto) {
      dispatch(setIsChangeProfilePhotoActionCreator(false));
      photoInputRef.current.value = "";
    }
  }, [isChangeProfilePhoto, dispatch]);

  useEffect(() => {
    if (isChangeProfilePassword) {
      dispatch(setIsChangeProfilePasswordActionCreator(false));
      setPassword("");
      setNewPassword("");
    }
  }, [isChangeProfilePassword, dispatch, setPassword, setNewPassword]);

  function handleProfileSubmit(event) {
    event.preventDefault();
    dispatch(asyncSetIsChangeProfile(name, email));
  }

  function handlePhotoSubmit(event) {
  event.preventDefault();
  const file = photoInputRef.current.files[0];
  if (file) dispatch(asyncSetIsChangeProfilePhoto(file));
}

  function handlePasswordSubmit(event) {
    event.preventDefault();
    dispatch(asyncSetIsChangeProfilePassword(password, newPassword));
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Profil Saya</h1>

      <section className="flex items-center gap-4">
        {profile.photo ? (
          <img
            src={getImageUrl(profile.photo)}
            alt={profile.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        <form onSubmit={handlePhotoSubmit} className="space-y-2">
          <label htmlFor="photo" className="block text-sm font-medium">
            Foto profil
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            ref={photoInputRef}
          />
          <button type="submit" className={buttonClass}>
            Unggah foto
          </button>
        </form>
      </section>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold">Informasi akun</h2>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nama
          </label>
          <input id="name" value={name} onChange={onNameChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" type="email" value={email} onChange={onEmailChange} className={inputClass} />
        </div>
        <button type="submit" className={buttonClass}>
          Simpan perubahan
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold">Ganti kata sandi</h2>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Kata sandi lama
          </label>
          <input id="password" type="password" value={password} onChange={onPasswordChange} className={inputClass} />
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
            Kata sandi baru
          </label>
          <input id="newPassword" type="password" value={newPassword} onChange={onNewPasswordChange} className={inputClass} />
        </div>
        <button type="submit" className={buttonClass}>
          Ganti kata sandi
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;