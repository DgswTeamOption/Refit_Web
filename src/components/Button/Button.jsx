import { ButtonContainer } from "./Button.styles";
function Button({ text, color, width, height, textSize, onClick }) {
  return (
    <ButtonContainer $color={color} $width={width} $height={height} $textSize={textSize} onClick={onClick}>
      {text}
    </ButtonContainer>
  );
}

export default Button;