import { FaPrint } from 'react-icons/fa';
import {
    SiGraphql,
    SiReact,
    SiFirebase,
    SiTypescript,
    SiTailwindcss,
    SiReactquery,
    SiReactrouter,
    SiGooglecalendar,
    SiAxios,
    SiSocketdotio,
    SiGoland,
    SiTestinglibrary,
    SiExpress,
    SiRollupdotjs,
    SiJest,
    SiVitest
    
} from 'react-icons/si'
import { IconType } from 'react-icons';

export const iconMap = {
    tailwindcss: SiTailwindcss,
    typescript: SiTypescript,
    "react-router-dom": SiReactrouter,
    "react-query": SiReactquery,
    "react-icons": SiReact,
    firebase: SiFirebase,
    dayjs: SiGooglecalendar,
    axios:SiAxios,
    "socket.io":SiSocketdotio,
    pocketbase:SiGoland,
    "@testing-library": SiTestinglibrary,
    "react-to-print": FaPrint,
    "@tanstack":SiReactquery,
    rollup: SiRollupdotjs,
    express:SiExpress,
    graphql: SiGraphql,
    jest: SiJest,
    vitest:SiVitest
};

// const arr = Object.keys(iconMap) as (keyof typeof iconMap)[];

// export type ISubDeps = typeof arr 

type IconMapKeys = keyof typeof iconMap;
type IconMapKeysLiteral = `${IconMapKeys}`;

export const arr = Object.keys(iconMap) as IconMapKeys[];
export type ISubDeps = IconMapKeysLiteral;
