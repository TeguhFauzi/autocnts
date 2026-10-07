import { deleteItem } from "./actions";
import { ItemsList } from "./ItemsList";

export const dynamic = "force-dynamic";

export default function ItemsPage() {
    return <ItemsList deleteAction={deleteItem} />;
}
