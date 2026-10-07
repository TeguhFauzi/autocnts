import { deleteInvoice } from "./actions";
import { InvoicesList } from "./InvoicesList";

export const dynamic = "force-dynamic";

export default function InvoicesPage() {
    return <InvoicesList deleteAction={deleteInvoice} />;
}
