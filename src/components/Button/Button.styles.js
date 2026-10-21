import styled from "styled-components";
export const ButtonContainer = styled.button`
    display: flex;
    align-items: center;
    color:${props=>props.color==="yellow"?"black":"white"};
    justify-content: center;
    width:${props=>props.width}px;
    height:${props=>props.height}px;
    background-color: ${props => {
    const colorMap = {
        red: "var(--color-red)",
        blue: "var(--color-blue)",
        gray: "var(--color-gray)",
        yellow: "var(--color-yellow)",
    };
    return colorMap[props.color] || "var(--color-white)";
    }};
    font-size:${props=>props.textSize}px;
    font-weight:bold;
    border-radius: 10px;
    border:none;
    transition-duration:0.2s;
    white-space: nowrap;
    &:hover{
    
    }
`