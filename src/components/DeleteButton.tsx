"use client";

import { useState } from "react";
import { IconTrash } from "@/components/icons";
import { useLang } from "@/lib/context";

export function DeleteButton({
    action,
    label,
}: {
    action: () => Promise<void> | void;
    label?: string;
}) {
    const { t } = useLang();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
            setOpen(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="icon-btn icon-btn-danger tip"
                data-tip={t("delete")}
            >
                <IconTrash className="w-4 h-4" />
            </button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setOpen(false)}>
                    <div className="card w-full max-w-sm p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0">
                                <IconTrash className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">{t("delete")}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{label ?? t("deleteRecord")}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn btn-ghost px-4 py-2 text-sm">
                                {t("cancel")}
                            </button>
                            <button type="button" onClick={handleConfirm} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
                                {busy ? t("processing") : t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
