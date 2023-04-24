import GitHubImage from '../res/github.jpg'
import { TypeAnimation } from 'react-type-animation';
interface introProps {}

export default function Intro({}:introProps){
  return (
    <div className="p-5 flex min-h-[90vh] w-[100%] flex-col  ">
      <div className="text-4xl font-bold md:text-xl gradient-text">
        Hi there, am
      </div>

      <div className="mt-[100px] w-full flex justify-evenly items-center">
      <div className="max-w-[60%]">

        <h2 className=" mt-[5%] text-7xl md:text-9xl  font-bold gradient-text">
          Dennis Kinuthia
        </h2>

        <div className="font-sarif mt-[30px] text-2xl font-bold  md:text-6xl gradient-text">
          <TypeAnimation
            cursor={true}
            sequence={['Javascript','Typescript ','React Developer']}
            wrapper="h1"
            className=""
          />
        </div>

        <div className="font-sarif mt-[40px] text-base  text-green-200  md:text-lg">

          React
          ❤️ tailwindcss
          ❤️ react-query
          ❤️ GraphQL
        </div>

        </div>

        <div className=''>
          <div className='w-full md:min-w-[10%] flex justify-center'>
            <img
              alt="Dennis Kinuthia"
              src={GitHubImage}
              height="350px"
              width="350px"
              className='rounded-2xl aspect-square' />
          </div>
        </div>

      </div>





    </div>
  )
}


