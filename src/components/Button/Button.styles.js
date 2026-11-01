
import styled from "styled-components";

export const ButtonContainer = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;

    color: ${props => {
        const textColorMap = {
            yellow: "black",
            lightGray: "var(--color-neutral-400, #666666)",
            transparentRed: "var(--color-danger-red, #F04444)",
            transparent: "var(--color-neutral-300, #555555)",
        };

        return textColorMap[props.$color] || "white";
    }};

    width: ${props => props.$width}px;
    height: 38px;

    background-color: ${props => {
        const colorMap = {
            red: "var(--color-red)",
            blue: "var(--color-blue)",
            gray: "var(--color-gray)",
            yellow: "var(--color-yellow)",
            lightGray: "var(--color-neutral-950, #F3F3F3)",
            transparent: "transparent",
            transparentRed: "transparent",
        };

        return colorMap[props.$color] || "var(--color-white)";
    }};

    font-size: 13px;
    font-weight: bold;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    white-space: nowrap;

    &:hover {
        background-color: ${props => {
            const hoverColorMap = {
                red: "color-mix(in srgb, var(--color-red), black 10%)",
                blue: "color-mix(in srgb, var(--color-blue), black 10%)",
                gray: "color-mix(in srgb, var(--color-gray), black 10%)",
                yellow: "color-mix(in srgb, var(--color-yellow), black 10%)",
                lightGray: "#E5E5E5",
                transparent: "var(--color-neutral-950, #F3F3F3)",
                transparentRed: "rgba(240, 68, 68, 0.1)",
            };

            return hoverColorMap[props.$color] || "var(--color-neutral-200)";
        }};
    }

    &:active {
        transform: scale(0.97);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;
