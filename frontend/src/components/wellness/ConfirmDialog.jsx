import React, { useEffect, useRef } from "react";

export default function ConfirmDialog({
    open,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    const ref = useRef(null);

    useEffect(() => {
        if (open && ref.current) ref.current.showModal();
    }, [open]);

    const close = () => {
        if (ref.current?.open) ref.current.close();
        onCancel?.();
    };

    const confirm = () => onConfirm?.();

    return (
        <dialog ref={ref} className="modal">
            <div className="modal-box max-w-md rounded-3xl overflow-hidden p-0 border border-[#F4D7C8]">
                <div className="px-5 py-4 bg-[#FFF2EA] border-b border-[#F4D7C8]">
                    <h3 className="font-semibold text-lg text-neutral-900">{title}</h3>
                </div>

                <div className="px-5 py-5 text-neutral-700">{description}</div>

                <div className="px-5 pb-5 flex items-center justify-end gap-2">
                    <button className="px-4 py-2.5 rounded-xl hover:bg-neutral-100" onClick={close}>
                        {cancelText}
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:opacity-90" onClick={confirm}>
                        {confirmText}
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop" onClick={close}>
                <button>close</button>
            </form>
        </dialog>
    );
}