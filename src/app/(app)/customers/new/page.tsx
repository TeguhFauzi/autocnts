import { PartyFormServer } from "@/components/PartyFormServer";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
    return (
        <PartyFormServer
            title="New Customer"
            subtitle="Create a customer"
            basePath="/customers"
            action={createCustomer}
            submitLabel="Create"
        />
    );
}
