import { ButtonContainer } from "./Button.styles";
function Button({ text, color, width, onClick }) {
  return (
    <ButtonContainer $color={color} $width={width} onClick={onClick}>
      {text}
    </ButtonContainer>
  );
}

export default Button;