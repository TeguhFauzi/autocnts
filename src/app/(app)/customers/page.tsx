import { PartyList } from "@/components/PartyList";
import { deleteCustomer } from "./actions";

export const dynamic = "force-dynamic";

export default function CustomersPage() {
    return (
        <PartyList
            title="Customers"
            subtitle="Accounts receivable parties"
            basePath="/customers"
            apiPath="/api/customers"
            deleteAction={deleteCustomer}
            deleteLabelKey="deleteCustomer"
        />
    );
}
