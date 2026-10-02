import { Cannon } from "./Cannon";

interface Props {
  lapsOfEarth: number;
}

const MAX_INDIVIDUAL_STAMPS = 5;

/** One cannon stamp per completed lap of the Earth, plus one for the lap in progress. */
export function LapStamps({ lapsOfEarth }: Props) {
  const completed = Math.floor(lapsOfEarth);
  const label = `${completed} lap${completed === 1 ? "" : "s"} completed, lap ${completed + 1} in progress`;

  return (
    <div className="lap-stamps" role="img" aria-label={label}>
      {completed > MAX_INDIVIDUAL_STAMPS ? (
        <div className="lap-stamp-multi">
          <div className="lap-stamp lap-stamp-complete">
            <Cannon wheelFill="var(--gold)" size={26} />
          </div>
          <span className="lap-stamp-count">&times;{completed}</span>
        </div>
      ) : (
        Array.from({ length: completed }, (_, i) => (
          <div key={i} className="lap-stamp lap-stamp-complete">
            <Cannon wheelFill="var(--gold)" size={26} />
          </div>
        ))
      )}
      <div className="lap-stamp lap-stamp-progress">
        <Cannon wheelFill="var(--navy)" size={26} />
      </div>
    </div>
  );
}
