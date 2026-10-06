import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconX } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";
import {
  asyncAddLostFound,
  setIsLostFoundAddedActionCreator,
} from "../states/action";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500";

function AddModal({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isLostFoundAdd = useSelector((state) => state.isLostFoundAdd);
  const isLostFoundAdded = useSelector((state) => state.isLostFoundAdded);

  const [title, onTitleChange] = useInput("");
  const [description, onDescriptionChange] = useInput("");
  const [status, onStatusChange] = useInput("lost");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isLostFoundAdded) {
      dispatch(setIsLostFoundAddedActionCreator(false));
      onClose();
      onSuccess();
    }
  }, [isLostFoundAdded, dispatch, onClose, onSuccess]);

  function handleSubmit(event) {
    event.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    dispatch(asyncAddLostFound(title, description, status));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="add-modal-title" className="text-lg font-bold">
            Tambah Laporan
          </h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label htmlFor="add-title" className="mb-1 block text-sm font-medium">Judul</label>
            <input id="add-title" value={title} onChange={onTitleChange} className={inputClass} />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="add-description" className="mb-1 block text-sm font-medium">Deskripsi</label>
            <textarea id="add-description" rows={4} value={description} onChange={onDescriptionChange} className={inputClass} />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="add-status" className="mb-1 block text-sm font-medium">Jenis laporan</label>
            <select id="add-status" value={status} onChange={onStatusChange} className={inputClass}>
              <option value="lost">Barang hilang</option>
              <option value="found">Barang ditemukan</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 hover:bg-slate-100">
              Batal
            </button>
            <button
              type="submit"
              disabled={isLostFoundAdd}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLostFoundAdd ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddModal;