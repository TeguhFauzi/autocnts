import { PartyFormServer } from "@/components/PartyFormServer";
import { createSupplier } from "../actions";

export default function NewSupplierPage() {
    return (
        <PartyFormServer
            title="New Supplier"
            subtitle="Create a supplier"
            basePath="/suppliers"
            action={createSupplier}
            submitLabel="Create"
        />
    );
}
