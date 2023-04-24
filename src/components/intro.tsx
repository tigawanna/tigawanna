import GitHubImage from '../res/github.jpg'
import { TypeAnimation } from 'react-type-animation';
interface introProps {}

export default function Intro({}:introProps){
  return (
    <div className="mt-[60px] flex min-h-screen w-[100%] flex-col bg-slate-700 pl-4">
      <div className="font-mono text-2xl font-bold text-green-300 md:text-xl ">
        Hi there, am
      </div>
      <div className="mt-[100px] flex flex-col">

        <div className="font-sarif mt-[5%] text-6xl font-bold text-green-400 md:text-8xl">
          Dennis Kinuthia
        </div>

        <div className="font-sarif mt-[30px] text-3xl font-bold text-slate-200 md:text-6xl">
          <TypeAnimation
            cursor={true}
            sequence={['Javascript','Typescript ','React Developer']}
            wrapper="h1"
            className="text-green-300"
          />
        </div>

        <div className="font-sarif mt-[40px] text-base  text-green-200 md:w-[40%] md:text-lg">

          ❤️ React
          ❤️ tailwindcss
          ❤️ react-query
          ❤️ GraphQL
        </div>





      </div>
    </div>
  )
}

{/* <div className='w-full md:min-w-[10%] flex justify-center'>
  <img
    alt="Dennis Kinuthia"
    src={GitHubImage}
    height="350px"
    width="350px"
    className='rounded-2xl aspect-square' />
</div> */}
