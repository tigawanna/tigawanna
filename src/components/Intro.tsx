"use client";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
interface introProps {}

export default function Intro({}: introProps) {
  return (
    <div className="flex h-full min-h-[90vh]  w-full flex-col  items-center justify-center p-5">
      <div className="left-[5%] top-[1%] md:top-[3%] w-full text-xl font-bold lg:w-[95%] ">
        Hi there, am
      </div>

      <div className=" mt-[5%] md:mt-[10%] flex w-full flex-col items-center justify-center gap-5
       md:flex-row lg:w-[95%]">
        <div className="lg:max-w-[60%]">
          <h2 className="  animate-text bg-gradient-to-r  from-teal-500 
        via-purple-500 to-orange-700 bg-clip-text text-7xl font-black text-transparent md:text-9xl
        ">
            Dennis Kinuthia
          </h2>

          <div className="font-sarif mt-[30px] h-10 md:h-20 bg-gradient-to-r from-blue-500  via-green-500
              to-purple-500 bg-clip-text text-4xl font-bold text-transparent md:text-6xl 
          ">
            <TypeAnimation
              cursor={true}
              sequence={["Javascript", "Typescript ", "React Developer"]}
              wrapper="h1"
              className=""
            />
          </div>
        </div>

        <div className="flex w-[90%] min-w-[200px]  justify-center p-2 lg:w-[30%]">
          <Image
            src="/github.jpg"
            alt="Dennis Kinuthia"
            className="aspect-square w-[100%] h-auto rounded-2xl shadow shadow-accent "
            width={300}
            height={300}
            priority
          />
        </div>
      </div>
    </div>
  );
}
