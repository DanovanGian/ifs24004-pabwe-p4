import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconUser,
} from "@tabler/icons-react";
import { getImageUrl, showConfirmDialog } from "../../../helpers/toolsHelper";
import { asyncSetIsAuthLogout } from "../../auth/states/action";
import {
  setIsProfileActionCreator,
  setProfileActionCreator,
} from "../../users/states/action";

function NavbarComponent({ onMenuClick }) {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  async function handleLogout() {
    const result = await showConfirmDialog("Yakin ingin keluar dari akun?");
    if (result.isConfirmed) {
      dispatch(asyncSetIsAuthLogout());
      dispatch(setProfileActionCreator(null));
      dispatch(setIsProfileActionCreator(false));
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <IconMenu2 size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          Lost &amp; Founds
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isDropdownOpen}
          onClick={() => setIsDropdownOpen((open) => !open)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
        >
          {profile.photo ? (
            <img
              src={getImageUrl(profile.photo)}
              alt={profile.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold">{profile.name}</span>
            <span className="flex items-center gap-1 text-xs text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sesi aktif
            </span>
          </span>
          <IconChevronDown size={16} />
        </button>

        {isDropdownOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              <IconUser size={18} /> Profil Saya
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <IconLogout size={18} /> Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default NavbarComponent;