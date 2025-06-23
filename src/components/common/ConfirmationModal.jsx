import React, { forwardRef } from "react";

/**
 * Komponen modal konfirmasi yang bisa digunakan ulang.
 * Menggunakan elemen <dialog> HTML5 dan dikontrol via ref.
 * @param {string} title - Judul modal.
 * @param {React.ReactNode} children - Konten atau pesan yang ditampilkan di dalam modal.
 * @param {function} onConfirm - Fungsi yang akan dipanggil saat tombol konfirmasi utama ditekan.
 * @param {boolean} isLoading - Status loading untuk menampilkan spinner pada tombol konfirmasi.
 */
const ConfirmationModal = forwardRef(
  ({ title, children, onConfirm, isLoading }, ref) => {
    return (
      // 'ref' dari parent akan langsung terhubung ke elemen <dialog> ini
      <dialog ref={ref} id="confirmation_modal" className="modal">
        <div className="modal-box">
          {/* Form dengan method="dialog" adalah cara DaisyUI/HTML untuk membuat tombol di dalamnya bisa menutup modal */}
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg">{title || "Konfirmasi Aksi"}</h3>

          <div className="py-4">{children}</div>

          <div className="modal-action">
            {/* Tombol Batal ini juga menggunakan form method="dialog" untuk menutup modal */}
            <form method="dialog">
              <button className="btn">Batal</button>
            </form>

            {/* Tombol konfirmasi utama yang akan menjalankan aksi */}
            <button
              className="btn btn-error" // 'btn-error' untuk aksi berbahaya seperti delete
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Konfirmasi & Hapus"
              )}
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

export default ConfirmationModal;
