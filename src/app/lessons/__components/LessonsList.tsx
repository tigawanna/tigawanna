import { getLessons } from "./api";
import { LessonCard } from "./LessonCard";

interface LessonsListProps {
    page?: number
    perPage?: number
    date?: string
}

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth();
const dateToday = date.getDate();
const defaultDate = `${year}-${month}-${dateToday}`;
// page=1,limit=6,date=defaultDate
export async function LessonsList({page=1,perPage=6,date=defaultDate,}: LessonsListProps) {
  const lessons = await getLessons(page,perPage,date);
  return (
    <div className="w-full h-full  flex flex-col p-5">
      <ul className="w-full flex flex-wrap  gap-5">
        {lessons.items.map((lesson, index) => {
          return <LessonCard item={lesson} key={index} />;
        })}
      </ul>
    </div>
  );
}
