import { VOTING_SCALES, VotingScaleKey } from "@planning-poker/shared";

interface Props {
  votingScale: VotingScaleKey;
  selectedValue: string | null;
  disabled: boolean;
  onVote: (value: string) => void;
}

export default function VoteCard({ votingScale, selectedValue, disabled, onVote }: Props) {
  const scale = VOTING_SCALES[votingScale];
  const allCards = [...scale.cards, ...scale.specialCards];

  return (
    <div style={styles.hand}>
      {allCards.map((value) => (
        <button
          key={value}
          data-value={value}
          disabled={disabled}
          onClick={() => onVote(value)}
          className={`poker-card ${selectedValue === value ? "selected" : ""}`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hand: { display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" },
};
