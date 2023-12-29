import * as colors from "./colors.json";

export interface GithubLanguagesProps {
  data: Record<string, number>;
  // width: number;
  // textColor?: string;
  // lightColor?: string;
}

export function GithubLanguages(props: GithubLanguagesProps) {
  if (!props.data) {
    return null;
  }

  // let total = 0;
  // Object.keys(props.data).forEach((lang: string) => {
  //   total += props.data[lang];
  // });
  const total = Object.values(props.data).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-1 w-full">
      <h2 className="text-2xl">Languages</h2>
      <div className="w-full">
        <ul className="w-full flex flex-wrap list-none m-0 p-0 gap-2 overflow-hidden ">
          {Object.entries(props.data).map(([k, v], index: number) => {
        
            const percent = (v / total) * 100;
            const percetage = percent < 5 ? percent + 5 : percent;
            return (
              <li
                key={k}
                className="md:max-w-[80%]"
                style={{
                  width: `${percetage}%`,
                }}
              >
                <div
                  className="min-w-3  rounded-lg w-full h-4"
                  style={{
                    backgroundColor:
                      colors[k as keyof typeof colors]["color"] ?? "",
                  }}
                >
                  .
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="w-full">
        <ul
          className="flex flex-wrap list-none m-0 p-0 gap-2 overflow-hidden">
          {Object.keys(props.data).map((language: string) => {
            return (
              <li
                key={`${language}-name`}
                className="flex  items-center"
    
              >
                <span
                  className="w-3 h-3"
                  style={{
                  backgroundColor:
                      colors[language as keyof typeof colors]["color"] ?? "",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontWeight: 700,
                    marginLeft: 5,
                    marginRight: 5,
        
                  }}
                >
                  {language}
                </span>
                <span >
                  {((props.data[language] / total) * 100).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
