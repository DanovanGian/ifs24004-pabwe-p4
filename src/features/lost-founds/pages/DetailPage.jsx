import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconArrowLeft, IconEdit, IconPhoto, IconTrash } from "@tabler/icons-react";
import {
  formatDate,
  getImageUrl,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import {
  asyncDeleteLostFound,
  asyncSetLostFound,
  setIsLostFoundDeletedActionCreator,
} from "../states/action";
import ChangeModal from "../modals/ChangeModal";
import ChangeCoverModal from "../modals/ChangeCoverModal";

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lostFound = useSelector((state) => state.lostFound);
  const isLostFound = useSelector((state) => state.isLostFound);
  const isLostFoundDeleted = useSelector((state) => state.isLostFoundDeleted);

  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [isCoverOpen, setIsCoverOpen] = useState(false);

  const reload = useCallback(() => {
    dispatch(asyncSetLostFound(id));
  }, [dispatch, id]);

  const closeChange = useCallback(() => setIsChangeOpen(false), []);
  const closeCover = useCallback(() => setIsCoverOpen(false), []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (isLostFoundDeleted) {
      dispatch(setIsLostFoundDeletedActionCreator(false));
      navigate("/");
    }
  }, [isLostFoundDeleted, dispatch, navigate]);

  async function handleDelete() {
    const result = await showConfirmDialog("Yakin ingin menghapus laporan ini?");
    if (result.isConfirmed) {
      dispatch(asyncDeleteLostFound(id));
    }
  }

  if (!isLostFound) {
    return <p className="text-slate-500">Memuat laporan...</p>;
  }

  if (!lostFound) {
    return (
      <div>
        <p className="text-slate-500">Laporan tidak ditemukan.</p>
        <Link to="/" className="mt-2 inline-block font-semibold text-indigo-600">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const buttonClass =
    "flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100";

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
        <IconArrowLeft size={16} /> Kembali
      </Link>

      {lostFound.cover ? (
        <img
          src={getImageUrl(lostFound.cover)}
          alt={lostFound.title}
          className="max-h-[28rem] w-full rounded-xl bg-slate-100 object-contain"
        />
      ) : (
        <div className="flex h-56 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          Tidak ada foto
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 ${lostFound.status === "lost" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
          {lostFound.status === "lost" ? "Barang hilang" : "Barang ditemukan"}
        </span>
        <span className={`rounded-full px-3 py-1 ${lostFound.is_completed ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"}`}>
          {lostFound.is_completed ? "Selesai" : "Dalam proses"}
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold">{lostFound.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dilaporkan oleh {lostFound.author.name} • {formatDate(lostFound.created_at)}
        </p>
      </div>

      <p className="whitespace-pre-line text-slate-700">{lostFound.description}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setIsCoverOpen(true)} className={buttonClass}>
          <IconPhoto size={18} /> Ganti cover
        </button>
        <button type="button" onClick={() => setIsChangeOpen(true)} className={buttonClass}>
          <IconEdit size={18} /> Ubah data
        </button>
        <button type="button" onClick={handleDelete} className={`${buttonClass} text-red-600`}>
          <IconTrash size={18} /> Hapus
        </button>
      </div>

      {isChangeOpen && (
        <ChangeModal lostFound={lostFound} onClose={closeChange} onSuccess={reload} />
      )}
      {isCoverOpen && (
        <ChangeCoverModal lostFoundId={lostFound.id} onClose={closeCover} onSuccess={reload} />
      )}
    </article>
  );
}

export default DetailPage;