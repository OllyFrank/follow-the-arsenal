import { Cannon } from "./Cannon";

interface Props {
  attended: boolean;
  disabled: boolean;
  label: string;
  onToggle: (next: boolean) => void;
  size?: number;
}

/** The ticket's circular "attended" stamp — a real button, not a styled checkbox. */
export function AttendToggle({ attended, disabled, label, onToggle, size = 48 }: Props) {
  return (
    <button
      type="button"
      className={`attend-toggle${attended ? " attended" : ""}`}
      style={{ width: size, height: size }}
      aria-pressed={attended}
      aria-label={label}
      disabled={disabled}
      onClick={() => onToggle(!attended)}
    >
      <Cannon wheelFill="var(--white)" size={Math.round(size * 0.625)} />
    </button>
  );
}
