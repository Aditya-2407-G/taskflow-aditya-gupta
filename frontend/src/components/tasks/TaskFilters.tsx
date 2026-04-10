interface Props {
  status: string;
  onStatusChange: (status: string) => void;
}

export function TaskFilters({ status, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm font-medium">Filter by status:</label>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
      >
        <option value="">All</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
