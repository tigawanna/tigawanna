interface threeProps {

}

export default function three({}:threeProps){
return (
 <div className='w-full h-full flex items-center justify-center'>

<main className="w-full"><section className="w-full h-screen flex flex-col items-center justify-center space-y-4 text-center bg-[#f5f5f5]"><div className="space-y-2"><h1 className="text-4xl font-bold tracking-tighter">
      John Doe, Full Stack JavaScript Developer
    </h1><p className="mx-auto max-w-[700px] text-gray-500">
      Crafting high-quality web applications with a focus on performance and user experience.
    </p></div><button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-4 py-2 underline text-blue-600">
    Learn More
  </button></section><section className="w-full h-screen flex flex-col items-center justify-center space-y-4 text-center bg-white"><div className="space-y-2"><h2 className="text-3xl font-bold tracking-tighter">
      About Me
    </h2><p className="mx-auto max-w-[700px] text-gray-500">
      With over 5 years of experience in software engineering, I specialize in building efficient, scalable, and user-friendly JavaScript applications. My tech stack includes React, Node.js, Express, and MongoDB.
    </p></div><button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-4 py-2 underline text-blue-600">
    View My Work
  </button></section><section className="w-full h-screen flex flex-col items-center justify-center space-y-4 text-center bg-[#f5f5f5]"><div className="space-y-2"><h2 className="text-3xl font-bold tracking-tighter">
      Contact Me
    </h2><p className="mx-auto max-w-[700px] text-gray-500">
      Interested in working together or want to say hi? Feel free to reach out.
    </p></div><button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-blue-600 text-white px-4 py-2 rounded-md">
    Get In Touch
  </button></section></main>
 </div>
);
}
