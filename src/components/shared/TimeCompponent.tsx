import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { twMerge } from "tailwind-merge";
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

interface TimeCompponentProps extends React.HTMLAttributes<HTMLDivElement> {
time:string;
relative?:boolean;
format?:string;
}

export function TimeCompponent({time,format,relative,...props}:TimeCompponentProps){
const date_format = format ??"ddd, MMM D, YYYY h:mm A";
const date_time = dayjs(time).format(date_format);

    // Check if the time was more than 4 weeks ago
    const time_diff = dayjs().diff(dayjs(time), 'weeks');
    const is_more_than_4_weeks = time_diff >= 4;




// const relative_time = dayjs().to(time);
//     const display_time = relative ? relative_time : date_time
// const realative_format = 

// Set the display time to relative time if the time was more than 4 weeks ago
  const display_time = (is_more_than_4_weeks || relative) ? dayjs().to(time) : date_time;


return (
 <div {...props} 
    className={twMerge("text-xs font-bold text-secondary-foreground p-1", props.className)}>
        {display_time}
 </div>
);
}
