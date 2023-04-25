import social from '../../res/foreach.jpg'
import real_estate from '../../res/real-estate.jpg'
import project from '../../res/project.webp'
import github from '../../res/github.jpg'


export const projects_list =[
    {
        "name": "ForEach",
        "description":`a simple social media timeline , built with react and pocketbase`,
        "link": "https://github.com/tigawanna/foreach",
        "hosted": "https://devhub-brown.vercel.app/",
        "technologies": ["React", "vite", "tailwind", "react-query", "pocketbase"],
        "image": social
    },
    {
        "name": "Mashamba",
        "description": "a simple real estate site built with rakkasjs and pocketbase",
        "link": "https://github.com/tigawanna/mashamba",
        "hosted": "https://mashamba.vercel.app/",
        "technologies": ["React", "rakkasjs", "tailwind", "pocketbase"],
        "image": real_estate

    },
    {
        "name": "Awesome Teams",
        "description": " role based project management system built using react and pocketbase",
        "link": "https://github.com/tigawanna/awesome-teams",
        "hosted": "https://awesome-notes.vercel.app/",
        "technologies": ["React", "vite", "tailwind", "react-query", "zustand", "pocketbase"],
        "image": project
    },
    {
        "name": "Gittyhub",
        "description": " Social media Themed github client built on the github graphql API",
        "link": "https://github.com/tigawanna/gittyhub",
        "hosted": "http://gittyhub.vercel.app/",
        "technologies": ["React", "vite", "tailwind", "react-location", "relay", "Github GraphQL API"],
        "image":github

    }
]
