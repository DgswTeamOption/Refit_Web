import styled from "styled-components"
import CalendarBefore from "../../assets/CalendarBefore.svg"
import CalendarAfter from "../../assets/CalendarAfter.svg"
import { CalendarContainer } from "./Calendar.styles"
import CalendarBlock from "./CalendarBlock"
import "./Calendar.css"
import { useState } from "react"
function Claendar({state,role}){
    const today = new Date();
    const [year,setYear] = useState(today.getFullYear());
    const [month,setMonth] = useState(today.getMonth());
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return(<CalendarContainer>
        <div className="CalendarHead">
            <div className="CalendarMonth">{year}년{month+1}월</div>
            <div className="CalendarButtonWrap">
                <button onClick={()=>{
                    if(month<1){
                        setYear(year-1)
                        setMonth(11)
                    }else{
                        setMonth(month-1)
                    }
                    }}><img src={CalendarBefore}/></button>
                <button onClick={()=>{
                    if(month>=11){
                        setYear(year+1)
                        setMonth(0)
                    }else{
                        setMonth(month+1)
                    }
                    }}><img src={CalendarAfter}/></button>
            </div>
        </div>{state=="all"}
        <div className="CalendarBody">
            <CalendarBlock date={"일"} isWeekend={true}/>
            <CalendarBlock date={"월"} isWeekend={true}/>
            <CalendarBlock date={"화"} isWeekend={true}/>
            <CalendarBlock date={"수"} isWeekend={true}/>
            <CalendarBlock date={"목"} isWeekend={true}/>
            <CalendarBlock date={"금"} isWeekend={true}/>
            <CalendarBlock date={"토"} isWeekend={true}/>
            <CalendarBlock date={1} colors={["red","yellow"]}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            <CalendarBlock date={1}/>
            {}
        </div>
        <div className="CalendarFoot">
            <div className="CalendarFootTag">
                <div className="CalendarSircle CalendarSircleYellow"></div>
                <div>출석</div>
            </div>
            <div className="CalendarFootTag">
                <div className="CalendarSircle CalendarSircleBlue"></div>
                <div>결석</div>
            </div>
            <div className="CalendarFootTag">
                <div className="CalendarSircle CalendarSircleRed"></div>
                <div>보강</div>
            </div>
            <div className="CalendarFootTag">
                <div className="CalendarSircle CalendarSircleGreen"></div>
                <div>보강대기중</div>
            </div>
        </div>
    </CalendarContainer>)
}
export default Claendar