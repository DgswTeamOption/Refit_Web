import "./Condition.css";

const conditionColors = {
    "결석": "red",
    "거절됨": "red",
    "출석": "blue",
    "수락됨": "blue",
    "보강": "yellow",
    "대기중": "gray",
    "필요": "yellow",
    "불필요": "gray",
};

export default function Condition({ status = "대기중" }) {
    const color = conditionColors[status];

    if (!color) return null;

    return (
        <span className={`condition condition--${color}`}>
    {status}
  </span>
    );
}