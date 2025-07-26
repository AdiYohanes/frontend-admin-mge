import React from "react";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { formatCurrency } from "../../../utils/formatters";

const PrintPreviewModal = ({ isOpen, onClose, orderData }) => {
  const handlePrint = () => {
    if (!orderData) {
      toast.error("No data to print");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${orderData.noTransaction}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { page-break-inside: avoid; }
            }
            body {
              font-family: 'Courier New', monospace;
              background: white;
              color: black;
              margin: 0;
              padding: 20px;
            }
            .receipt {
              background: white;
              color: black;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 16px;
              max-width: 320px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 16px;
            }
            .logo-container {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              margin: 0 auto 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .logo {
              width: 32px;
              height: 32px;
              object-fit: contain;
            }
            .slogan {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .receipt-title {
              font-weight: bold;
              font-size: 24px;
              color: #D4AF37;
              margin-bottom: 4px;
              font-family: monospace;
            }
            .company-name {
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 4px;
            }
            .address {
              font-size: 10px;
              color: #666;
              line-height: 1.2;
            }
            .transaction-details {
              border-top: 1px dashed #ccc;
              border-bottom: 1px dashed #ccc;
              padding: 12px 0;
              margin-bottom: 12px;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              font-size: 10px;
            }
            .detail-item span {
              color: #666;
            }
            .detail-item div {
              font-weight: bold;
            }
            .items-section {
              border-bottom: 1px dashed #ccc;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 8px;
            }
            .item {
              margin-bottom: 8px;
            }
            .item-name {
              font-weight: 600;
            }
            .item-price {
              font-size: 10px;
              color: #666;
            }
            .item-total {
              display: flex;
              justify-content: space-between;
            }
            .summary-section {
              border-bottom: 1px dashed #ccc;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 4px;
            }
            .total-row {
              font-weight: bold;
              font-size: 18px;
              color: #D4AF37;
              margin-bottom: 4px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .contact-info {
              text-align: left;
            }
            .footer-slogan {
              font-size: 10px;
              color: #666;
              margin-bottom: 8px;
            }
            .contact-details {
              font-size: 10px;
              color: #666;
            }
            .contact-details p {
              margin: 4px 0;
            }
            .qr-code {
              width: 64px;
              height: 64px;
              background: #f0f0f0;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .qr-text {
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <img src="/images/logo.png" alt="Logo" class="logo">
              </div>
              <p class="slogan">Make Good Enough</p>
              <h1 class="receipt-title">Receipt</h1>
              <h4 class="company-name">Medan Gaming Ecosystem</h4>
              <p class="address">
                Setiabudi Square (Komplek Tasbi 1), Jl. Setia Budi C-3, TJ. Sari, Kec. Medan Selayang, Kota Medan, Sumatera Utara, 20132
              </p>
            </div>

            <!-- Transaction Details -->
            <div class="transaction-details">
              <div class="details-grid">
                <div class="detail-item">
                  <span>NO. RECEIPT</span>
                  <div>${orderData.noTransaction}</div>
                </div>
                <div class="detail-item">
                  <span>DATE</span>
                  <div>${orderData.tanggalTransaksi}</div>
                </div>
                <div class="detail-item">
                  <span>TABLE</span>
                  <div>VIP 4/2</div>
                </div>
                <div class="detail-item">
                  <span>CASHIER</span>
                  <div>${orderData.admin}</div>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="items-section">
              <div class="items-header">
                <span>ITEMS</span>
                <span>PRICE</span>
              </div>
              <div class="item">
                <div class="item-name">${orderData.orderName}</div>
                <div class="item-price">1 x ${formatCurrency(orderData.totalPembayaran)}</div>
              </div>
              <div class="item-total">
                <div></div>
                <div style="font-weight: bold;">${formatCurrency(orderData.totalPembayaran)}</div>
              </div>
            </div>

            <!-- Summary -->
            <div class="summary-section">
              <div class="summary-row">
                <span>SUBTOTAL</span>
                <span>${formatCurrency(orderData.totalPembayaran)}</span>
              </div>
              <div class="summary-row">
                <span>TAX (10%)</span>
                <span>${formatCurrency(orderData.totalPembayaran * 0.1)}</span>
              </div>
              <div class="total-row">
                <span>TOTAL</span>
                <span>${formatCurrency(orderData.totalPembayaran * 1.1)}</span>
              </div>
              <div class="summary-row">
                <span>BAYAR (${orderData.metodePembayaran})</span>
                <span>${formatCurrency(orderData.totalPembayaran * 1.1)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="contact-info">
                <p class="footer-slogan">Make Good Enough</p>
                <div class="contact-details">
                  <p>Wi-Fi Password : 7314_Gaming</p>
                  <p>WhatsApp : 085156764805</p>
                  <p>Instagram : MGE_medangamingecosystem</p>
                </div>
              </div>
              <div class="qr-code">
                <span class="qr-text">QR</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    toast.success("Print window opened!");
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

        {/* Area struk untuk pratinjau */}
        <div id="area-cetak" className="my-4">
          <div className="bg-white text-black font-mono text-sm p-4 max-w-xs mx-auto">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <p className="text-xs text-gray-700 mb-2">Make Good Enough</p>
              <h1 className="font-bold text-2xl text-brand-gold mb-1" style={{ fontFamily: 'monospace' }}>Receipt</h1>
              <h4 className="font-bold text-base mb-1">Medan Gaming Ecosystem</h4>
              <p className="text-xs text-gray-600 leading-tight">
                Setiabudi Square (Komplek Tasbi 1), Jl. Setia Budi C-3, TJ. Sari, Kec. Medan Selayang, Kota Medan, Sumatera Utara, 20132
              </p>
            </div>

            {/* Transaction Details */}
            <div className="border-t border-b border-dashed border-gray-400 py-3 mb-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">NO. RECEIPT</span>
                  <div className="font-bold">{orderData.noTransaction}</div>
                </div>
                <div>
                  <span className="text-gray-600">DATE</span>
                  <div className="font-bold">{orderData.tanggalTransaksi}</div>
                </div>
                <div>
                  <span className="text-gray-600">TABLE</span>
                  <div className="font-bold">VIP 4/2</div>
                </div>
                <div>
                  <span className="text-gray-600">CASHIER</span>
                  <div className="font-bold">{orderData.admin}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
              <div className="flex justify-between font-bold text-xs mb-2">
                <span>ITEMS</span>
                <span>PRICE</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="font-semibold">{orderData.orderName}</div>
                  <div className="text-xs text-gray-600">1 x {formatCurrency(orderData.totalPembayaran)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="flex-grow"></div>
                  <div className="font-bold">{formatCurrency(orderData.totalPembayaran)}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>SUBTOTAL</span>
                <span>{formatCurrency(orderData.totalPembayaran)}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span>TAX (10%)</span>
                <span>{formatCurrency(orderData.totalPembayaran * 0.1)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-brand-gold mb-1">
                <span>TOTAL</span>
                <span>{formatCurrency(orderData.totalPembayaran * 1.1)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>BAYAR ({orderData.metodePembayaran})</span>
                <span>{formatCurrency(orderData.totalPembayaran * 1.1)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-start">
              <div className="text-left">
                <p className="text-xs text-gray-700 mb-2">Make Good Enough</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Wi-Fi Password : 7314_Gaming</p>
                  <p>WhatsApp : 085156764805</p>
                  <p>Instagram : MGE_medangamingecosystem</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">QR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Tutup
          </button>
          <button className="btn bg-brand-gold text-white hover:bg-brand-gold/80" onClick={handlePrint}>
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
