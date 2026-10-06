import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  formatDate,
  getImageUrl,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import {
  asyncDeleteLostFound,
  asyncSetLostFounds,
  asyncSetLostFoundStats,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import AddModal from "../modals/AddModal";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500";

function sumValues(obj = {}) {
  return Object.values(obj).reduce((total, value) => total + value, 0);
}

function HomePage() {
  const dispatch = useDispatch();
  const { hash } = useLocation();
  const lostFounds = useSelector((state) => state.lostFounds);
  const stats = useSelector((state) => state.lostFoundStats);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [status, onStatusChange] = useInput("");
  const [isCompleted, onIsCompletedChange] = useInput("");
  const [keyword, onKeywordChange] = useInput("");
  const [isMe, setIsMe] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadLostFounds = useCallback(() => {
    dispatch(
      asyncSetLostFounds({
        status,
        is_completed: isCompleted,
        is_me: isMe ? 1 : "",
      })
    );
  }, [dispatch, status, isCompleted, isMe]);

  const handleSuccess = useCallback(() => {
    loadLostFounds();
    dispatch(asyncSetLostFoundStats());
  }, [dispatch, loadLostFounds]);

  const handleCloseAdd = useCallback(() => setIsAddOpen(false), []);

  // muat daftar setiap filter berubah
  useEffect(() => {
    loadLostFounds();
  }, [loadLostFounds]);

  // muat statistik sekali
  useEffect(() => {
    dispatch(asyncSetLostFoundStats());
  }, [dispatch]);

  // setelah hapus berhasil
  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeletedActionCreator(false));
      handleSuccess();
    }
  }, [isLostFoundDeleted, dispatch, handleSuccess]);

  // menu "Statistik" di sidebar (/#statistik)
  useEffect(() => {
    if (hash === "#statistik") {
      document.getElementById("statistik").scrollIntoView();
    }
  }, [hash]);

  async function handleDelete(id) {
    const result = await showConfirmDialog("Yakin ingin menghapus laporan ini?");
    if (result.isConfirmed) {
      dispatch(asyncDeleteLostFound(id));
    }
  }

  const data = stats ?? {};
  const lostTotal = sumValues(data.stats_losts);
  const foundTotal = sumValues(data.stats_founds);
  const completedTotal =
    sumValues(data.stats_losts_completed) + sumValues(data.stats_founds_completed);

  const summaryCards = [
    { label: "Total", value: lostTotal + foundTotal },
    { label: "Barang Hilang", value: lostTotal },
    { label: "Barang Ditemukan", value: foundTotal },
    { label: "Selesai", value: completedTotal },
  ];

  const filtered = lostFounds.filter((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Laporan Lost &amp; Founds</h1>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
        >
          <IconPlus size={18} /> Tambah Laporan
        </button>
      </div>

      <section id="statistik" aria-label="Statistik" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-extrabold">{card.value}</p>
          </div>
        ))}
      </section>

      <section aria-label="Filter" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="Cari laporan"
          placeholder="Cari judul atau deskripsi..."
          value={keyword}
          onChange={onKeywordChange}
          className={`${selectClass} w-full sm:w-72`}
        />
        <select aria-label="Filter jenis" value={status} onChange={onStatusChange} className={selectClass}>
          <option value="">Semua jenis</option>
          <option value="lost">Hilang</option>
          <option value="found">Ditemukan</option>
        </select>
        <select aria-label="Filter status selesai" value={isCompleted} onChange={onIsCompletedChange} className={selectClass}>
          <option value="">Semua status</option>
          <option value="0">Dalam proses</option>
          <option value="1">Selesai</option>
        </select>
        <label htmlFor="is-me" className="flex items-center gap-2 text-sm">
          <input
            id="is-me"
            type="checkbox"
            checked={isMe}
            onChange={(e) => setIsMe(e.target.checked)}
          />
          Laporan saya
        </label>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <li key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {item.cover ? (
              <img src={getImageUrl(item.cover)} alt={item.title} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-400">
                Tidak ada foto
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className={`rounded-full px-2 py-0.5 ${item.status === "lost" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {item.status === "lost" ? "Hilang" : "Ditemukan"}
                </span>
                <span className={`rounded-full px-2 py-0.5 ${item.is_completed ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
                  {item.is_completed ? "Selesai" : "Dalam proses"}
                </span>
              </div>
              <h2 className="font-bold">{item.title}</h2>
              <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
              <p className="text-xs text-slate-400">
                {item.author.name} • {formatDate(item.created_at)}
              </p>
              <div className="flex items-center justify-between pt-1">
                <Link to={`/lost-founds/${item.id}`} className="text-sm font-semibold text-indigo-600">
                  Lihat detail
                </Link>
                <button
                  type="button"
                  aria-label={`Hapus ${item.title}`}
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <IconTrash size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="text-slate-500">Belum ada laporan.</p>}

      {isAddOpen && <AddModal onClose={handleCloseAdd} onSuccess={handleSuccess} />}
    </div>
  );
}

export default HomePage;