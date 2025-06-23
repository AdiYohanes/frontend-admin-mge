import React from "react";
// import { useReactToPrint } from 'react-to-print'; // 1. Beri komentar pada impor ini
import { PrinterIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../../../utils/formatters";
// Kita tidak lagi butuh komponen Receipt terpisah jika hanya untuk preview
// import Receipt from './Receipt';

const PrintPreviewModal = ({ isOpen, onClose, orderData }) => {
  // const receiptRef = useRef(null); // 2. Beri komentar pada ref

  /* 3. Beri komentar pada keseluruhan hook useReactToPrint
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `struk-${orderData?.noTransaction || 'receipt'}`,
    onAfterPrint: () => toast.success("Proses cetak/simpan PDF selesai."),
  });
  */

  // 4. Buat fungsi handler placeholder yang baru
  const handlePlaceholderPrint = () => {
    console.log("Struk already printed.", orderData);
    toast.success("Fungsi print dinonaktifkan sementara.");
  };

  if (!isOpen || !orderData) return null;

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 max-w-sm">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Pratinjau Struk</h3>

        {/* Area struk untuk pratinjau. Tidak perlu ref lagi. */}
        <div id="area-cetak">
          <div className="bg-white text-black font-mono text-sm p-4 my-4 rounded-md border">
            <div className="text-center mb-4">
              <h4 className="font-bold text-lg">RENTAL PS SUKA-SUKA</h4>
              <p className="text-xs">Jl. Bahagia Selalu No. 123, Semarang</p>
            </div>
            <div className="border-t border-b border-dashed border-black py-2">
              <div className="flex justify-between">
                <span>No. Transaksi</span>
                <span>{orderData.noTransaction}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span>{orderData.tanggalTransaksi}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin</span>
                <span>{orderData.admin}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer</span>
                <span>{orderData.name}</span>
              </div>
            </div>
            <div className="py-2">
              <div className="flex font-semibold">
                <div className="flex-grow">Item</div>
                <div className="w-12 text-center">Qty</div>
                <div className="w-20 text-right">Harga</div>
              </div>
              <div className="flex border-b border-dotted border-black pb-2">
                <div className="flex-grow">{orderData.orderName}</div>
                <div className="w-12 text-center">{orderData.quantity}x</div>
                <div className="w-20 text-right">
                  {formatCurrency(orderData.totalPembayaran)}
                </div>
              </div>
            </div>
            <div className="border-t border-dashed border-black pt-2">
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(orderData.totalPembayaran)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Metode</span>
                <span>{orderData.metodePembayaran}</span>
              </div>
            </div>
            <div className="text-center mt-4">
              <p>Terima Kasih!</p>
              <p className="text-xs">
                Simpan struk ini sebagai bukti pembayaran.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Tutup
          </button>
          {/* 5. Arahkan onClick ke fungsi placeholder yang baru */}
          <button className="btn btn-primary" onClick={handlePlaceholderPrint}>
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
