import type { NextPage } from 'next'
import Head from 'next/head'
// import Link from 'next/link'
import  Intro  from '../components/intro';
import About  from '../components/about';
import   Projects, { Project }  from '../components/projects';
import { local_projects } from './../util/aboututils';
import { motion } from 'framer-motion';
import {FaLinkedinIn,FaGithub,FaDev} from 'react-icons/fa'
import { IconContext } from 'react-icons/lib';
import Link from 'next/link'

const Home: NextPage = () => {



  const variants = {
    open: {
     transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    },
    closed: {
     transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
   };
 

  const projects=local_projects as Project[]


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Dennis Kinuthia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full h-[100%] flex-col bg-slate-700">
     <Intro/>

     <motion.div 
      initial={{y:0, x:-50, opacity:0.1 }}
      whileInView={{opacity:1,y:0,x:0}} 
      transition={{type:"spring",stiffness:20}}
      className="flex justify-end  w-[100%] p-1 sticky top-0 z-50 bg-slate-700">
      <div className='p-1 m-1 flex '>
      <IconContext.Provider
        value={{ size: "30px",className:"mx-2" }}>

          <div className='my-2 md:my-0 text-sm md:text-lg  text-slate-300 font-mono'>
         
          <Link href="https://github.com/tigawanna"
          ><a target="_blank" className="text-green-400">
             <FaGithub />
            </a></Link>
          </div>

          <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          <Link href="https://linkedin.com/in/dennis-kinuthia" >
            <a target="_blank" className="text-green-400">
              <FaLinkedinIn />
            </a></Link>
          </div>
      
          <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          <Link href="https://dev.to/tigawanna" >
            <a target="_blank" className="text-green-400">
              <FaDev />
            </a></Link>
          </div>
      
        </IconContext.Provider>
      </div>
      </motion.div>

      <About/>
      <Projects fb_projects={projects}/>
      </main>

      <footer className="index-footer">
        <div className='text-base md:text-lg text-slate-300 font-bold'>
          Contact me  
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          Email: denniskinuthiaw@gmail.com  
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          Github:<Link href="https://github.com/tigawanna" 
          ><a target="_blank" className="text-green-400">tigawanna</a></Link>
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          Linkden:
          <Link href="https://linkedin.com/in/dennis-kinuthia"
          ><a target="_blank" className="text-green-400">dennis kinuthia</a></Link>
        </div>

        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
          Articles:
          <Link href="https://dev.to/tigawanna"
          ><a target="_blank" className="text-green-400">tigawanna</a></Link>
        </div>
      </footer>
    </div>
  )
}

export default Home
