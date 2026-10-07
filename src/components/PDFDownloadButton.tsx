"use client";

import { useState } from "react";
import { IconDownload } from "@/components/icons";

export function PDFDownloadButton({
    eid,
    docNo,
    className = "btn-primary shadow-sm",
    tip,
    children,
}: {
    eid: string;
    docNo: string;
    className?: string;
    tip?: string;
    children?: React.ReactNode;
}) {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (downloading) return;
        setDownloading(true);

        try {
            // Load html2pdf dynamically if not present
            if (!(window as any).html2pdf) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // Fetch invoice HTML template silently in background
            const res = await fetch(`/api/invoices/${eid}/pdf`);
            const htmlText = await res.text();

            // Create invisible container in current DOM
            const container = document.createElement("div");
            container.style.position = "fixed";
            container.style.top = "-9999px";
            container.style.left = "-9999px";
            container.style.width = "800px";
            container.innerHTML = htmlText;
            document.body.appendChild(container);

            const targetElement = container.querySelector(".invoice-box") || container;

            const opt = {
                margin: 10,
                filename: `Invoice-${docNo}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            };

            await (window as any).html2pdf().set(opt).from(targetElement).save();

            // Clean up container
            document.body.removeChild(container);
        } catch (err) {
            console.error("PDF Download error:", err);
            // Fallback: open URL in iframe / new tab if fails
            window.open(`/api/invoices/${eid}/pdf?pdf=true`, "_blank");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={className}
            data-tip={tip}
            type="button"
        >
            {downloading ? (
                <svg
                    className="animate-spin w-4 h-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : (
                children || (
                    <>
                        <IconDownload className="w-4 h-4 mr-1.5" />
                        Download File PDF (.pdf)
                    </>
                )
            )}
        </button>
    );
}
