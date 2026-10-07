import { deleteAccount, toggleAccountActive } from "./actions";
import { AccountsList } from "./AccountsList";

export const dynamic = "force-dynamic";

export default function AccountsPage() {
    return (
        <AccountsList
            deleteAction={deleteAccount}
            toggleAction={toggleAccountActive}
        />
    );
}
