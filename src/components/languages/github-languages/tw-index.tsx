
import * as colors from './colors.json'

export interface GithubLanguagesProps {
  data: Record<string, number>;
  width: number;
  textColor?: string;
  lightColor?: string;
}

export function GithubLanguages(props: GithubLanguagesProps) {

  if (!props.data) {
    return null;
  }

    let total = 0;
    Object.keys(props.data).forEach((lang: string) => {
      total += props.data[lang];
    });

    return (
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl'>Languages</h2>
        <div>
          <ul 
          className='flex flex-wrap list-none m-0 p-0 gap-2 overflow-hidden'>
            {Object.keys(props.data).map((language: string, index: number) => {
              return (
                <li key={language}>
                  <div
                  className='flex gap-1 h-10 mr-3'
                    style={{
                      backgroundColor:
                        colors[language as keyof typeof colors]["color"] ?? "",
                      width: Math.max(
                        (props.data[language] / total) * props.width,
                        5,
                      ),
                      // height: 10,
                      // marginRight: 2,
                      // borderRadius:
                      //   index === 0
                      //     ? index === Object.keys(props.data).length - 1
                      //       ? "10px 10px 10px 10px"
                      //       : "10px 0 0 10px"
                      //     : index === Object.keys(props.data).length - 1
                      //       ? "0 10px 10px 0"
                      //       : "0 10px 10px 0",
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <div style={{ width: props.width }}>
          <ul style={{ display: "flex", flexWrap: "wrap", listStyleType: "none", margin: 0, padding: 0, overflow: 'hidden' }}>
            {Object.keys(props.data).map((language: string) => {
              return (
                <li
                  key={`${language}-name`}
                  style={{
                    margin: 2,
                    display: "flex",
                    justifyItems: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      height: 10,
                      width: 10,
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
                      color: props.textColor,
                    }}
                  >
                    {language}
                  </span>
                  <span style={{ color: props.lightColor || "gray" }}>
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
