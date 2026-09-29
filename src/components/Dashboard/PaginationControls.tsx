interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn" disabled={page === 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="pagination-label">
        Page {page + 1} of {totalPages}
      </span>
      <button
        className="btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
