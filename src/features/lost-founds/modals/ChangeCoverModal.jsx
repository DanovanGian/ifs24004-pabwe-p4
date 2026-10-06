import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconX } from "@tabler/icons-react";
import {
  asyncChangeLostFoundCover,
  setIsLostFoundChangedCoverActionCreator,
} from "../states/action";

function ChangeCoverModal({ lostFoundId, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const isLostFoundChangeCover = useSelector((state) => state.isLostFoundChangeCover);
  const isLostFoundChangedCover = useSelector((state) => state.isLostFoundChangedCover);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  // lepas URL pratinjau lama saat berganti file atau modal ditutup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (isLostFoundChangedCover) {
      dispatch(setIsLostFoundChangedCoverActionCreator(false));
      onClose();
      onSuccess();
    }
  }, [isLostFoundChangedCover, dispatch, onClose, onSuccess]);

  function handleFileChange(event) {
    const selected = event.target.files[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }
    setError("");
    dispatch(asyncChangeLostFoundCover(lostFoundId, file));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <h2 id="cover-modal-title" className="text-lg font-bold">
            Ganti Cover
          </h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cover" className="mb-1 block text-sm font-medium">Pilih gambar</label>
            <input id="cover" type="file" accept="image/*" onChange={handleFileChange} />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {preview && (
            <img src={preview} alt="Pratinjau cover" className="max-h-64 w-full rounded-lg object-contain" />
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 hover:bg-slate-100">
              Batal
            </button>
            <button
              type="submit"
              disabled={isLostFoundChangeCover}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLostFoundChangeCover ? "Mengunggah..." : "Unggah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangeCoverModal;