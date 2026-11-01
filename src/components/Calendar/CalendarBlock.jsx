function CalendarBlock ({date,isWeekend,colors}){
    if(!date==0&&date){
        
    return(
    <div className="CalendarBlock">
        <div className={`CalendarDate${isWeekend?"Weekend":""}`}>{date}</div>
        <div className="CalendarCircleWrap">
            {Array.isArray(colors)&&colors!==null?colors.map((color)=>{
            color = color[0].toUpperCase()+color.slice(1)
            return <div className={`CalendarCircle CalendarCircle${color}`}></div>
        }):""}
        </div>
        
    </div>)}
    else{
        return(
            <div className="CalendarBlock"></div>
        )
    }
}
export default CalendarBlock