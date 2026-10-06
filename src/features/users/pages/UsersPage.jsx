import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useInput from "../../../hooks/useInput";
import { getImageUrl } from "../../../helpers/toolsHelper";
import { asyncSetUsers } from "../states/action";

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);
  const [keyword, onKeywordChange] = useInput("");

  useEffect(() => {
    dispatch(asyncSetUsers());
  }, [dispatch]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Daftar Pengguna</h1>

      <input
        type="search"
        placeholder="Cari nama pengguna..."
        aria-label="Cari pengguna"
        value={keyword}
        onChange={onKeywordChange}
        className="mt-4 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
      />

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            {user.photo ? (
              <img
                src={getImageUrl(user.photo)}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>

      {filteredUsers.length === 0 && (
        <p className="mt-6 text-slate-500">Tidak ada pengguna ditemukan.</p>
      )}
    </div>
  );
}

export default UsersPage;