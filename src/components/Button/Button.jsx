import { ButtonContainer } from "./Button.styles";
function Button({ text, color='blue', width=100, onClick, disabled = false, size = 'default' }) {
  return (
    <ButtonContainer $color={color} $width={width} $size={size} onClick={onClick} disabled={disabled}>
      {text}
    </ButtonContainer>
  );
}

export default Button;
