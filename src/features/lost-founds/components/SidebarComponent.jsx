import { NavLink } from "react-router-dom";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

const menus = [
  { to: "/", label: "Dashboard", icon: IconLayoutDashboard, end: true },
  { to: "/#statistik", label: "Statistik", icon: IconChartBar, end: true },
  { to: "/users", label: "Pengguna", icon: IconUsers, end: false },
  { to: "/profile", label: "Profil Saya", icon: IconUser, end: false },
];

function SidebarComponent({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          data-testid="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        aria-label="Menu utama"
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex justify-end lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <IconX size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {menus.map((menu) => (
            <NavLink
              key={menu.label}
              to={menu.to}
              end={menu.end}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <menu.icon size={20} />
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default SidebarComponent;