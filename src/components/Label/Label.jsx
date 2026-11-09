import styled from "styled-components"
import "./Label.css"
function Label({LabelText="레이블",id,placeHolder="",type="text",inputButton=null,width=400,underText}){
    return(<div className="Label">
        <label htmlFor={id}>{LabelText}</label>
        {(inputButton!==null)?
        <div className="InputWrap">
            <InputContainer $width={width} id={id} type={type} placeholder={placeHolder}/>
            {inputButton}
        </div>
        :<InputContainer $width={width} id={id} type={type} placeholder={placeHolder}/>
        }
        <div className="inputUnder">{underText}</div>
    </div>)
}
const InputContainer = styled.input`
    width:${props => props.$width}px;
    height:40px;
    font-size:13px;
    border:1px solid #E0E0E0;
    border-radius:8px;
    padding:5px;
    box-sizing:border-box;
    outline:none;
    &:focus{
    border:1.5px solid var(--color-blue);
    }
`
export default Label