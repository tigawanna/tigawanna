"use client";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
type introProps = {};

export default function Intro({}: introProps) {
  return (
    <div id="#" className="flex h-full   w-full flex-col  items-center justify-center p-5">
      <div className="left-[5%] top-[1%] md:top-[3%] w-full text-xl font-bold lg:w-[95%] ">
        Hi there, am
      </div>

      <div
        className=" mt-[3%] md:mt-[5%] flex w-full flex-col items-center justify-center gap-5
       md:flex-row lg:w-[95%]">
        <div className="lg:max-w-[60%]">
          <h2
            className="   bg-gradient-to-r  from-accent 
        via-secondary to-primary bg-clip-text text-7xl font-black text-transparent md:text-9xl
        ">
            Dennis Kinuthia
          </h2>

          <div
            className="font-sarif mt-[10px] h-10 md:h-20 bg-gradient-to-r from-secondary  via-secondary/80
              to-accent bg-clip-text text-4xl font-bold text-transparent md:text-6xl 
          ">
            <TypeAnimation
              cursor={true}
              sequence={["Javascript", "Typescript ", "Fullstack Developer"]}
              wrapper="h1"
              className=""
            />
          </div>
          <div className="mt-[20px] flex w-full flex-col items-start justify-start gap-5 md:flex-row">
          <a href="#projects">
            <button className="btn btn-secondary btn-outline text-xl ">
              View my work
            </button>
          </a>
          <a href="#contact">
          <button className="btn btn-primary text-xl ">
            Contact me
          </button>
          </a>

          </div>
        </div>

        <div className="flex w-[90%] min-w-[200px]  justify-center p-2 lg:w-[30%]">
          <Image
            src="/moi.jpg"
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
