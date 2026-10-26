function CalendarBlock ({date,isWeekend,colors}){
    if(!date==0&&date){
        
    return(
    <div className="CalendarBlock">
        <div className={`CalendarDate${isWeekend?"Weekend":""}`}>{date}</div>
        {Array.isArray(colors)&&colors!==null?colors.map((color)=>{
            return <div className={`CalendarSircle CalendarSircle${color}`}></div>
        }):""}
    </div>)}
    else{
        return(
            <div className="CalendarBlock"></div>
        )
    }
}
export default CalendarBlock