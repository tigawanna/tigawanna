
import { LanguagePercentage } from "./helpers";

interface GithubLangiagesProps {
  top_langs: LanguagePercentage[];

}

export function GithubLangiagesPercentage({top_langs}:GithubLangiagesProps){

if(!top_langs){
  return null
}

return (
  <div className="w-full h-full  flex items-center py-2 ">
    <div className="w-full h-full">
      <ul className="w-full flex flex-wrap  list-none m-0 px-5 gap-3  ">
        {top_langs.map(({color,name,percentage}, index: number) => {
          const percent = percentage
          const percetage = percent < 5 ? percent + 2 : percent;
          if(percentage<1){
            return null
          }
          return (
            <li
              key={name + index}
              className=" md:max-w-[70%] min-w-fit gap-1 flex flex-col justify-center "
              style={{
                width: `${percetage}%`,
              }}>
              <div
                className="min-w-[20%]  rounded-xl w-full h-4"
                style={{
                  backgroundColor: color ?? "",
                }}>
                
              </div>
              <div className="pl-1 text-xs flex min-w-fit gap-2">
                <div>{name}</div>
                <div> {percentage}%</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);
}
