import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  asyncChangeLostFound,
  setIsLostFoundChangedActionCreator,
} from "../states/action";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";

function ChangeModal({ lostFound, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isLostFoundChange = useSelector((state) => state.isLostFoundChange);
  const isLostFoundChanged = useSelector((state) => state.isLostFoundChanged);

  const [title, onTitleChange] = useInput(lostFound.title);
  const [description, onDescriptionChange] = useInput(lostFound.description);
  const [status, onStatusChange] = useInput(lostFound.status);
  const [isCompleted, setIsCompleted] = useState(Boolean(lostFound.is_completed));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLostFoundChanged) {
      dispatch(setIsLostFoundChangedActionCreator(false));
      onClose();
      onSuccess();
    }
  }, [isLostFoundChanged, dispatch, onClose, onSuccess]);

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    dispatch(
      asyncChangeLostFound(lostFound.id, title, description, status, isCompleted ? 1 : 0)
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="change-modal-title" className="text-lg font-bold">
            Ubah Laporan
          </h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="change-title" className="mb-1 block text-sm font-medium">Judul</label>
            <input id="change-title" value={title} onChange={onTitleChange} className={inputClass} />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="change-description" className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea id="change-description" rows={4} value={description} onChange={onDescriptionChange} className={inputClass} />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="change-status" className="mb-1 block text-sm font-medium">Jenis laporan</label>
            <select id="change-status" value={status} onChange={onStatusChange} className={inputClass}>
              <option value="lost">Barang hilang</option>
              <option value="found">Barang ditemukan</option>
            </select>
          </div>

          <label htmlFor="change-completed" className="flex items-center gap-2 text-sm font-medium">
            <input
              id="change-completed"
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            Tandai sudah selesai
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 hover:bg-slate-100">
              Batal
            </button>
            <button
              type="submit"
              disabled={isLostFoundChange}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLostFoundChange ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeModal;