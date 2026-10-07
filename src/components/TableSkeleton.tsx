interface TableSkeletonProps {
    rows?: number;
    cols?: number;
}

const WIDTHS = ["60%", "75%", "50%", "80%", "65%"];

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="animate-pulse">
                    {Array.from({ length: cols }).map((_, c) => (
                        <td key={c} className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                            <div
                                className="h-4 bg-gray-200 dark:bg-slate-700/60 rounded"
                                style={{ width: WIDTHS[(r + c) % WIDTHS.length] }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
