import type { ReactNode } from "react";
import type { LogbookPageId } from "../../hooks/useLogbookPage";

interface Props {
  id: LogbookPageId;
  pageNumber: number;
  heading: string;
  description: string;
  count: number;
  active: boolean;
  children: ReactNode;
}

export function LogbookPage({ id, pageNumber, heading, description, count, active, children }: Props) {
  const headingId = `${id}-h`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="badges-page"
      data-active={active ? "true" : undefined}
    >
      <div className="badges-page-margin" aria-hidden="true" />
      <div className="badges-page-meta">
        <div className="badges-page-meta-left">
          <div className="badges-page-number">Page {pageNumber} of 4</div>
          <h2 id={headingId} className="badges-page-heading">
            {heading}
          </h2>
          <p className="badges-page-desc">{description}</p>
        </div>
        <div className="badges-page-count">
          {count} badge{count === 1 ? "" : "s"}
        </div>
      </div>
      {children}
    </section>
  );
}
