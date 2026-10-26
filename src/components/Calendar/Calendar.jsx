import styled from "styled-components"
import CalendarBefore from "../../assets/CalendarBefore.svg"
import CalendarAfter from "../../assets/CalendarAfter.svg"
import { CalendarContainer } from "./Calendar.styles"
import CalendarBlock from "./CalendarBlock"
import "./Calendar.css"
import { useState } from "react"
function Claendar(){
    const today = new Date();
    const [year,setYear] = useState(today.getFullYear());
    const [month,setMonth] = useState(today.getMonth());
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return(<CalendarContainer>
        <div className="CalendarHead">
            <div className="CalendarMonth">{year}년{month+1}월</div>
            <div className="CalendarButtonWrap">
                <button><img src={CalendarBefore}/></button>
                <button><img src={CalendarAfter}/></button>
            </div>
        </div>
        <div className="CalendarBody">
            <CalendarBlock date={"일"} isWeekend={true}/>
            <CalendarBlock date={"월"} isWeekend={true}/>
            <CalendarBlock date={"화"} isWeekend={true}/>
            <CalendarBlock date={"수"} isWeekend={true}/>
            <CalendarBlock date={"목"} isWeekend={true}/>
            <CalendarBlock date={"금"} isWeekend={true}/>
            <CalendarBlock date={"토"} isWeekend={true}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            {}
        </div>
        <div className="CalendarFoot">
            <div className="CalendarSircle"></div>
            <div>영어</div>
        </div>
    </CalendarContainer>)
}
export default Claendar