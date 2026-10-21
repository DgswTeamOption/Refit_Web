import { ButtonContainer } from "./Button.styles"
function Button({text,color,onClick,width,height,textSize}){
    return(<ButtonContainer $primary={"primary"} color = {color} width={width} height={height} textSize={textSize} onClick={onClick} >
        {text}
    </ButtonContainer>
    )
}
export default Button;