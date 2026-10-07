import { deleteJournal } from "./actions";
import { JournalsList } from "./JournalsList";

export const dynamic = "force-dynamic";

export default function JournalsPage() {
    return <JournalsList deleteAction={deleteJournal} />;
}
