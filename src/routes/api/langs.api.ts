import { json } from "@hattip/response";
import { request } from 'graphql-request';

export function get() {

//     async function getLangs(){
//     try {


//         const resp = fetch('https://api.github.com/graphql', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' ,
//                  "Authorization": "Bearer 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"
//             },
//             body: JSON.stringify({ query:`
//             {
//    viewer {
//     repositories(first: 100) {
//       edges {
//         node {
//           id
//           languages(first: 10) {
//             edges {
//               node {
//                 id
//                 name
//                 color
//               }
//             }
//           }
//         }
//       }
//       totalCount
//     }
//   }

//  }
// ` }) })
    
// return (await resp).json()



// } catch (error) {
//         console.log("error fetching langs",error);
//     }
// }

const query = `
  query {
    viewer {
      login
    }
  }
`;

    const data = request('https://api.github.com/graphql', query, {
        headers: {
            Authorization: `Bearer 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`,
        },
    }).then((data) => data);



    return json({ hello:data });


}
