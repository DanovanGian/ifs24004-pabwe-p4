import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile } from "../../users/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function LostFoundLayout() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const isProfile = useSelector((state) => state.isProfile);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hasToken = Boolean(apiHelper.getAccessToken());

  useEffect(() => {
    if (hasToken && !isProfile) {
      dispatch(asyncSetProfile());
    }
  }, [hasToken, isProfile, dispatch]);

  if (!hasToken || (isProfile && !profile)) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Memuat sesi...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="flex">
        <SidebarComponent
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LostFoundLayout;