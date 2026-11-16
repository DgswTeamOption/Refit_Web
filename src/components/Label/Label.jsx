import styled from "styled-components";
import "./Label.css";

function Label({
  LabelText = "레이블",
  id,
  placeHolder = "",
  type = "text",
  inputButton = null,
  width = 550,
  underText,
  value,
  onChange,
  size = "default",
}) {
  const compact = size === "compact";

  return (
    <div className={compact ? "Label Label--compact" : "Label"}>
      <label htmlFor={id}>{LabelText}</label>
      {inputButton ? (
        <div className="InputWrap">
          <InputContainer
            $width={width}
            $compact={compact}
            id={id}
            type={type}
            placeholder={placeHolder}
            value={value}
            onChange={onChange}
          />
          {inputButton}
        </div>
      ) : (
        <InputContainer
          $width={width}
          $compact={compact}
          id={id}
          type={type}
          placeholder={placeHolder}
          value={value}
          onChange={onChange}
        />
      )}
      {underText && <div className="inputUnder">{underText}</div>}
    </div>
  );
}

const InputContainer = styled.input`
  width: ${(props) => props.$width}px;
  height: ${(props) => (props.$compact ? 36 : 48)}px;
  font-size: ${(props) => (props.$compact ? 13 : 16)}px;
  border: 1px solid #e0e0e0;
  border-radius: ${(props) => (props.$compact ? 7 : 8)}px;
  padding: 8px 12px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border: 1.5px solid var(--color-blue);
  }
`;

export default Label;
