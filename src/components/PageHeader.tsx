export function PageHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between mb-5 pr-16">
            <div>
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}
