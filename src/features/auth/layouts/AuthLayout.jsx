import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconPackage } from "@tabler/icons-react";
import apiHelper from "../../../helpers/apiHelper";

function AuthLayout() {
  const isAuthLogin = useSelector((state) => state.isAuthLogin);

  if (isAuthLogin || apiHelper.getAccessToken()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <IconPackage size={28} />
          Lost &amp; Founds
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Barangmu hilang? <br /> Atau menemukan sesuatu?
          </h1>
          <p className="mt-4 max-w-sm text-indigo-100">
            Laporkan barang hilang dan temuan, lalu pantau sampai urusannya
            selesai.
          </p>
        </div>
        <p className="text-sm text-indigo-200">Delcom Open API</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;