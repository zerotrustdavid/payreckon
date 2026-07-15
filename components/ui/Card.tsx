interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple panel container used to group a section of the dashboard.
 */
export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
