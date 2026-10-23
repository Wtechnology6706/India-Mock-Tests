"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { OrderRecord, Invoice } from "../../lib/commerce-store";

interface InvoiceModalProps {
  invoice: OrderRecord | Invoice | null;
  onClose: () => void;
  portalName?: string;
  logoImageUrl?: string;
  userDisplayName?: string;
  userEmail?: string;
}

function numberToWordsINR(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return "Zero Rupees Only";

  function convertLessThanOneThousand(n: number): string {
    let current = "";
    if (n >= 100) {
      current += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      current += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      current += a[n] + " ";
    }
    return current;
  }

  let result = "";
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + "Crore ";
  }
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + "Lakh ";
  }
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + "Thousand ";
  }
  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder);
  }

  return result.trim() + " Rupees Only";
}

export default function InvoiceModal({
  invoice,
  onClose,
  portalName = "Sarkari Practice",
  logoImageUrl = "",
  userDisplayName = "Student",
  userEmail = "",
}: InvoiceModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!invoice) return null;

  const totalAmount = invoice.amount || 0;
  const taxAmount = invoice.taxAmount || Math.round(totalAmount * 0.18);
  const taxableAmount = Math.max(0, totalAmount - taxAmount);
  const cgst = Math.round((taxAmount / 2) * 100) / 100;
  const sgst = Math.round((taxAmount / 2) * 100) / 100;
  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = new Date(invoice.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const amountInWords = numberToWordsINR(totalAmount);

  const handlePrint = () => {
    const originalTitle = document.title;
    // Format exam name into a clean, file-friendly string e.g. "BPSC_TRE_4_0"
    const examNameClean = (invoice.targetExamName || invoice.planName || "MockTest_Series")
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .replace(/\s+/g, "_");
    const invNoClean = (invoice.invoiceNumber || "INV").replace(/[^a-zA-Z0-9_\-]/g, "_");

    // Setting document.title directly sets the default PDF filename in the browser's "Save as PDF" dialog!
    const pdfFileName = `Tax_Invoice_${examNameClean}_${invNoClean}`;
    document.title = pdfFileName;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const modalContent = (
    <div id="invoice-print-portal">
      <style jsx global>{`
        @media print {
          /* Hide all top-level children of body except our portal */
          body > *:not(#invoice-print-portal) {
            display: none !important;
            visibility: hidden !important;
          }

          html,
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
            overflow: visible !important;
            height: auto !important;
          }

          #invoice-print-portal {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            z-index: 99999999 !important;
          }

          .invoice-no-print {
            display: none !important;
            visibility: hidden !important;
          }

          .invoice-paper {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin: 0 auto !important;
            padding: 12mm 15mm !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            page-break-inside: avoid !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* Modal Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: "20px",
          overflowY: "auto",
        }}
        onClick={onClose}
      >
        <div
          style={{
            maxWidth: "820px",
            width: "100%",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Action Bar (Not printed) */}
          <div
            className="invoice-no-print"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#1e293b",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🧾</span>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>
                  Official GST Tax Invoice
                </strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Invoice No: {invoice.invoiceNumber}
                  {invoice.targetExamName ? ` · ${invoice.targetExamName}` : ""}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  background: "linear-gradient(135deg, #059669, #047857)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(5, 150, 105, 0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                <span>🖨️ Print / Save as PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 14px",
                  background: "#334155",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Printable Invoice Paper Container (True A4 Formatted Layout) */}
          <div
            className="invoice-paper"
            style={{
              background: "#ffffff",
              color: "#0f172a",
              borderRadius: "12px",
              padding: "36px 42px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              border: "1px solid #e2e8f0",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            {/* Invoice Top Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                {logoImageUrl ? (
                  <img
                    src={logoImageUrl}
                    alt={portalName}
                    style={{
                      height: "44px",
                      maxWidth: "220px",
                      objectFit: "contain",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        background: "#b94a2b",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "16px",
                        padding: "4px 9px",
                        borderRadius: "5px",
                      }}
                    >
                      {portalName.slice(0, 1).toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        letterSpacing: "-0.5px",
                        color: "#0f172a",
                      }}
                    >
                      {portalName.toUpperCase()}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.4" }}>
                  <strong>{portalName} Edutech Platform</strong>
                  <br />
                  Online Assessment & Exam Preparation Services
                  <br />
                  Patna, Bihar, India - 800001
                  <br />
                  GSTIN: <strong>10AAACI1234F1Z5</strong> (Bihar - State Code: 10)
                  <br />
                  Helpdesk: support@sarkaripractice.com | info@sarkaripractice.com
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  TAX INVOICE
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  (Original for Recipient)
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    color: "#0f172a",
                    lineHeight: "1.5",
                  }}
                >
                  <div>
                    Invoice No: <strong>{invoice.invoiceNumber}</strong>
                  </div>
                  <div>
                    Invoice Date: <strong>{formattedDate}</strong>
                  </div>
                  <div>
                    Time: <strong>{formattedTime}</strong>
                  </div>
                  <div>
                    Place of Supply: <strong>Bihar (10) / India</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To / Order Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                padding: "14px 18px",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "24px",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Billed To (Student / Candidate)
                </span>
                <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                  {userDisplayName}
                </strong>
                <div style={{ color: "#334155" }}>
                  Email: {userEmail || "Registered Candidate"}
                </div>
                {invoice.targetExamName && (
                  <div style={{ color: "#047857", fontWeight: 700, marginTop: "4px", fontSize: "13px" }}>
                    Enrolled Examination: {invoice.targetExamName}
                  </div>
                )}
              </div>

              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Payment & Transaction Details
                </span>
                <div>
                  Order Reference: <strong>{invoice.orderNumber}</strong>
                </div>
                <div>
                  Payment Method: <strong>{invoice.paymentMethod || "Online (Razorpay / UPI)"}</strong>
                </div>
                <div>
                  Payment Status:{" "}
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: 700,
                      fontSize: "11px",
                    }}
                  >
                    PAID · SETTLED
                  </span>
                </div>
                <div>
                  Gateway Provider: <strong>{invoice.provider || "Razorpay India"}</strong>
                </div>
              </div>
            </div>

            {/* Itemized Services Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "20px",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr style={{ background: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a" }}>S.No</th>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a" }}>
                    Description of Services
                  </th>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a", textAlign: "center" }}>
                    SAC Code
                  </th>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a", textAlign: "center" }}>
                    Validity
                  </th>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a", textAlign: "right" }}>
                    Taxable Val (₹)
                  </th>
                  <th style={{ padding: "10px 12px", border: "1px solid #0f172a", textAlign: "right" }}>
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: "#ffffff" }}>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    1
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #cbd5e1" }}>
                    <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                      {invoice.planName}
                    </strong>
                    {invoice.targetExamName && (
                      <div style={{ color: "#047857", fontSize: "12px", fontWeight: 700, marginTop: "2px" }}>
                        Exam Track: {invoice.targetExamName}
                      </div>
                    )}
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                      Comprehensive Mock Tests, AI Question Explainer & Detailed Performance Analytics
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    999293
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    {invoice.durationMonths} Months
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    ₹{taxableAmount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #cbd5e1",
                      textAlign: "right",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    ₹{totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations & GST Breakdown */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Amount in words */}
              <div
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Amount in Words:
                </div>
                <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                  {amountInWords}
                </strong>

                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px dashed #cbd5e1",
                    fontSize: "11px",
                    color: "#64748b",
                  }}
                >
                  ✓ GST registered educational testing & online examination service provider.
                  <br />✓ SAC Code 999293 (Commercial training & coaching and computer-based testing).
                </div>
              </div>

              {/* Total Summary */}
              <div
                style={{
                  width: "280px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  overflow: "hidden",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ color: "#475569" }}>Taxable Amount:</span>
                  <strong>₹{taxableAmount.toFixed(2)}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#64748b",
                  }}
                >
                  <span>CGST (9%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 12px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#64748b",
                  }}
                >
                  <span>SGST (9%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  <span>Total Amount Paid:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms, Conditions & Digital Signature */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderTop: "1px solid #cbd5e1",
                paddingTop: "16px",
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              <div style={{ maxWidth: "460px", lineHeight: "1.5" }}>
                <strong>Terms & Conditions:</strong>
                <ol style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  <li>This test series pass provides non-transferable individual online exam access.</li>
                  <li>Inquiries/support can be addressed via support@sarkaripractice.com or info@sarkaripractice.com.</li>
                  <li>This is a system-generated Tax Invoice issued electronically under GST rules.</li>
                </ol>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    border: "1px dashed #059669",
                    borderRadius: "6px",
                    background: "#ecfdf5",
                    color: "#065f46",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "11px", letterSpacing: "0.5px" }}>
                    ✓ DIGITALLY VERIFIED
                  </div>
                  <div style={{ fontSize: "10px" }}>{portalName} Platform</div>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(modalContent, document.body);
}
