interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Renders on the darker inset surface, for panels nested inside a card. */
  inset?: boolean;
  actions?: React.ReactNode;
}

export function Card({
  title,
  description,
  children,
  className = "",
  inset = false,
  actions,
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-line ${
        inset ? "bg-inset" : "bg-surface"
      } ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold tracking-tight text-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
