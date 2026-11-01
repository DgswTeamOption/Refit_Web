import { ButtonContainer } from "./Button.styles";
function Button({ text, color='blue', width=100, onClick,disabled = false }) {
  return (
    <ButtonContainer $color={color} $width={width} onClick={onClick} disabled={disabled}>
      {text}
    </ButtonContainer>
  );
}

export default Button;