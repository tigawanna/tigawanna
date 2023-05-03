import GitHubImage from '../../res/github.jpg'
import { TypeAnimation } from 'react-type-animation';
interface introProps {}

export default function Intro({}:introProps){
  return (
    <div className="p-5 flex min-h-[90vh] w-full  flex-col justify-center items-center">
      <div className="text-xl font-bold  gradient-text w-full lg:w-[90%] ">
        Hi there, am
      </div>

      <div className="mt-[100px]  w-full lg:w-[95%] flex flex-col md:flex-row justify-center items-center gap-5">
      <div className="lg:max-w-[60%]">

        <h2 className="  text-7xl md:text-9xl  font-bold gradient-text">
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

 

        </div>

        <div className=''>
          <div className='w-full lg:min-w-[10%] flex justify-center'>
            <img
              alt="Dennis Kinuthia"
              loading='lazy'
              src={GitHubImage}
              height="350px"
              width="350px"
              className='rounded-2xl aspect-square w-[70%]' />
          </div>
        </div>

      </div>





    </div>

  )
}


