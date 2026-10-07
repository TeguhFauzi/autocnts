import { PartyList } from "@/components/PartyList";
import { deleteSupplier } from "./actions";

export const dynamic = "force-dynamic";

export default function SuppliersPage() {
    return (
        <PartyList
            title="Suppliers"
            subtitle="Accounts payable parties"
            basePath="/suppliers"
            apiPath="/api/suppliers"
            deleteAction={deleteSupplier}
            deleteLabelKey="deleteSupplier"
        />
    );
}
