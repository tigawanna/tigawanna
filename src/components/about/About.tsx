import Link from "next/link";
import { SectionHeader } from "../shared/SectionHeader";
import Image from "next/image";

interface introProps {

}

function About ({ }:introProps){


 return (
    <div className="mt-[10px] min-h-screen max-w-[99%] flex flex-col w-full">

     <SectionHeader heading='About Me' />
      <div className="flex-center w-full  flex-col justify-evenly ">

        <div className="flex w-full  h-full flex-col md:flex-row justify-evenly ">
          <div className="flex-center flex-col  h-full w-[95%]  p-4 m-2 gap-5 ">
            <div className="p-5 w-full md:w-[90%]  flex flex-col text-slate-50 border shadow shadow-slate-400 rounded-lg  gap-1">
              <ul className='w-full text-sm  flex flex-col gap-2'>
                <li>I am a passionate self-taught JavaScript/React developer .</li>
                <li>I have been working on React and Nodejs projects for more than  3 years </li>
                <li>I completed the ALX software engineering program
                  where we learned the basics of programming in C, Python, and Linux.</li>
              </ul>

              <Link
                href="https://www.alxafrica.com/software-engineering-"
                target="_blank" className="text-green-400">
                ALX software engineering program
              </Link>

             <Link
               href="https://drive.google.com/file/d/1Np5tm5nes0njyuZ5e436wVUm80tNlaBw/view?usp=sharing"
               target="_blank" 
               className="max-w-[95%] w-fit text-green-400 border shadow shadow-green-400 hover:scale-[101%] rounded-lg bg-slate-700 pt-5 pb-5 px-1">
               <h2 className='text-white p-2 font-serif'>ALX Software Engineering Certificate</h2>
               <Image alt='certificate preview'
               className='aspect-video rounded-lg' 
                src="https://lh3.googleusercontent.com/fife/APg5EOY9_NE7MRPj03WMoZcuDbOUpyEt5-yQk7r7uHKjN0dt0TOU3pFm-DamkQx90-T-74FYHByfzsyyL-Kd4rvRl9_ahGtZ44zvyU61h2mI8EX-nMEheJQWfHQxnHWoNjttd7ml21s2Z3-oTABc4Fqe7nuInmYh9nW4PmQiGOiwHmBhCAccLFEc9Frjr_LGe5fURIri3zZpdAAUsT9WmpCJqamlTLTCtFWWMjZjsuTFqmTxm9WybEColPKSNgY4QdiuGR4FBiQDJtwMMTb5CAvOjKTWSRzJ6lNSbUupFOIlr6wPdjMYFyJLkBOzPqwZGwre8qZ1nL5ul7A0Be4yLlvBz1fd9k3iBQgEwOhelflb3L0gdXW8bIq_r-lV2UgbHLGY0zQ9PAUqfmSr2a00pNEhtO_HBBwilbp1hGA88L8yWx3RXuiIZSdqkxPntoGvP6HYtXk7DAH8aWltw6RwHuTvJJczz16jIpFDuFHPq0h1rBvp01tWkd-QwY2K_3_XXZnc0kuIXoXaUiGzfrWadATBndwqNaea-Ti5Fk2aJxD9PgCv91UvopXF51sWfdtUoi1yf18g0UqAPQ1-8U6Vra7W6AV5vnHRNqJgSpIYokpuX96Eb7W4FpR_--KAt-N1hXjfFXz6V4yiczq_L45JP9Fvw0EJqjumM6WkIj-IfdyoFUYMn1EnSCPCqar4L-Bq0WQK5oALCdmz8-kx3snKMcNyJJVqMwkkbGDYS2ij8F9t3vm7N5XRqP9VsNdvl3UbhMcyV_GIyZeldF4vdfviEUXWGfzpxaoELExCeuHR05qPgcQgdEB-Mbfg6qyL7liaYzo2HiwXCcetmrBWKi_jymYa_ie33In2zIvg8wN7bAndWZijusHYtAdlaNkQ9I1OYZtgGBepQfPfXpCvzwnzlAcuL64nEnnzEnqLqlOE9xpqq1jxjXtT1TTuXrPrT_jYi0lYrmIT7fp847j9K0azu51kERDZrRCtTU0QVMZqGCz32MF6dAFUMrA7Pmi4INn6c7OSfQm21qTa07E6w_XCYq-e1GFgY8HN_PunpTjHI2vFrjfbVmRyjQqLPxh6_tC4K4Xi8fBakctMhV36WNTrxcTBN0bi5X7ri1oTO5lKgvqRseMBO5IwNnhbaG3OvrNTNE3bli8kFuTNTcGbRLhhRhilaVF8aj0kgOI8RtuSi8acbIPQ_z619V-qdgmKswAFTVF5ebK85uFcA1sGVu8mTAdVxxopaG1GOY2-YKYKjZV3dswfvl2Muf_7dPOcoQ2FPo3taEIZH44Pygr6KtOxsxGRqqFGklCR9d5fDz9zVrWr8IRg7jHqzE9H5IMP6PmxaOBzmx0gEyAOAbLF32dIpqKG3sn8pQhxd2qpZVNyZBozl-1RtnTUbM9K44S4EDS-_w-O6POdnafhNQ2iXLc52IVg7xzDYU_pYq-tjcm8Z0GT5y26lmcrOBmsu-k5ABPI8wHVsnsVXLPzDbrLD9D788sbtInHnc1Z=w300-k-nu" 
               width={400} height={200}/>
      
               </Link>

            </div>
          </div>
        </div>
           {/* <Languages /> */}
      </div>
      {/* <Icons /> */}
     

  
 
      {/* <Libraries /> */}
    </div>
  );
}
export default About
