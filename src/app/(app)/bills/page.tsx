import { deleteBill } from "./actions";
import { BillsList } from "./BillsList";

export const dynamic = "force-dynamic";

export default function BillsPage() {
    return <BillsList deleteAction={deleteBill} />;
}
