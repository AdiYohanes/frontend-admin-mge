import React, { forwardRef } from "react";
import { formatCurrency } from "../../../utils/formatters";

// Gunakan forwardRef untuk bisa menerima 'ref' dari komponen induk
const Receipt = forwardRef(({ orderData }, ref) => {
  if (!orderData) return null;

  return (
    // 'ref' akan ditempelkan ke div terluar dari struk ini
    <div ref={ref} className="bg-white text-black font-mono text-sm p-4">
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
        <p className="text-xs">Simpan struk ini sebagai bukti pembayaran.</p>
      </div>
    </div>
  );
});

export default Receipt;
