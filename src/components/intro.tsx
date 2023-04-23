import GitHubImage from '../res/github.jpg'

interface introProps {}

export default function Intro({}:introProps){
  return (
    <div className="h-[90vh] w-full flex flex-col items-center justify-center ">

     <div className='p-5 h-full w-full flex flex-col 
     md:flex-row items-center justify-center md:justify-between gap-2 '>

        <div className="w-[90%] flex flex-col min-w-[70%] gap-5">
          <h2 className=" mt-[5%] text-7xl md:text-9xl  font-bold text-green-400 gradient-text">
          Hi there, am Dennis Kinuthia
        </h2>
        <h3 className='w-[90%] text-slate-300 text-xl md:text-4xl'>
          Software engineer with a passion for building and learning new things
        </h3>
          <h3 className="   text-green-200  md:text-lg m-0 p-0">
            ❤️ React
            ❤️ tailwindcss
            ❤️ react-query
            ❤️ GraphQL
          </h3>
        </div>
        

        <div className='w-full md:min-w-[10%] flex justify-center'>
          <img
          alt="Dennis Kinuthia"
          src={GitHubImage} 
          height="350px"
          width="350px"
          className='rounded-2xl aspect-square'/>
        </div>

      </div>


    </div>
  )
}

