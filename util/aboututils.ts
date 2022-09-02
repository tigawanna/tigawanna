import  chat from '../res/chat.webp'
import  table from '../res/table-for-react.png'
import  property from '../res/property.webp'
import  project from '../res/project.webp'
import  github from '../res/github.jpg'
import gitdeck from '../res/gitdeck.webp'

export const metext=[     
    "A good user experience > fancy designs",
    "Making my custom logic when practical > installing libraries",
    "Effecient State management to optimise data usage and network requests",
    "Mobile first design",
    "Use tailwind to simplify and streamline the styles",
    "Minimal, clean aesthetic >>>>"
    ]


export const frontend=[
    'Html + CSS',
    'Vite',
    'Tailwind css',
    'framer-motion',
    'React/Nextjs',
    'React-Native',
    'redux',
    'react-query',
    'apollo-client',
    'firebase SDK',
    'REST',
    'GaraphQL'

]
 
export const backend=[
    'NodeJs+express',
    'graphQl + express-apollo-server',
    'Mongo db',
    'Postgresql',
    'Redis',
    'websockets + REST',
    'Firebase Admin SDK'
]


export const local_projects = [
  {
    title: 'GitPals',
    desc: `Exlore github and meet new develeopers, hopefully building something beautiful `,
    tools: [
      'react',
      'typescript',
      'react-query',
      'tailwindcss',
      'github',
      'gitpages',
      'react-icons',
      'dayjs',
      'github rest api',
    ],
    link: 'https://github.com/tigawanna/gitpals',
    previewlink: 'https://tigawanna.github.io/gitpals/',
    image: github,
  },
  {
    title: 'GitDeck',
    desc: `Ported over gitpals to Nextjs and switched to the github GraphQL api`,
    tools: [
      'react',
      'typescript',
      'react-query',
      'tailwindcss',
      'github',
      'graphql-tag',
      'react-icons',
      'dayjs',
      'github graphql api',
    ],
    link: 'https://github.com/tigawanna/gitdeck',
    previewlink: 'https://gitdeck-two.vercel.app/',
    image: gitdeck,
  },
  {
    title: 'Property Manager',
    desc: `Built using React for the client and Firebase for auth and database
        allows you to add your tenants ,enter  and tabulate all the payments ,
        edit update or delete them inline, 
        make invoices bills and print out staements for them.`,
    tools: [
      'react',
      'typescript',
      'react-query',
      'tailwindcss',
      'table-for-react',
      'firebase',
      'react-icons',
      'dayjs',
    ],
    link: 'https://github.com/tigawanna/project-mangaer',
    previewlink: 'https://tigawanna.github.io/project-mangaer/',
    image: property,
  },
  {
    title: 'table-for-react',
    desc: `NPM packege which is basically a plain html table component for react which allows you
         to create ,read, update, and delete directly from the table, 
         i made this after havng a hard time finding a table library to
         use in the propert manager app that meets the crud capabilities and
         gives me enough control in cases of validation and custom crud functions`,
    tools: [
      'tsdx',
      'storybook',
      'react',
      'typescript',
      'react-query',
      'tailwindcss',
      'react-icons',
      'dayjs',
    ],
    link: 'https://github.com/tigawanna/table-for-react',
    previewlink: 'https://tigawanna.github.io/table-for-react-example/',
    image: table,
  },
  {
    title: 'Chat App',
    desc: `Realime live chat with react and nodejs, messages are
         broadcasted out to every client and the server doesn't persist any data`,
    tools: [
      'react',
      'nodejs',
      'socket.io',
      'typescript',
      'tailwindcss',
      'react-icons',
      'dayjs',
    ],
    link: 'https://github.com/tigawanna/sockets-client',
    previewlink: 'https://tigawanna.github.io/sockets-client/',
    image: chat,
  },

  {
    title: 'Project manager',
    desc: `React app to help cordination , employees add 
        project proposals ,the manager approves or rejects them ,
         then they're moved to the funding phase then the employees 
         execute and make them done when completed`,
    tools: [
      'react',
      'typescript',
      'react-query',
      'tailwindcss',
      'firebase',
      'react-icons',
      'dayjs',
    ],
    link: 'https://github.com/tigawanna/projects',
    previewlink: 'https://tigawanna.github.io/projects',
    image: project,
  },
]
