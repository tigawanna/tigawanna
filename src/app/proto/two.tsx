interface twoProps {

}

export default function two({}:twoProps){
return (
 <div className='w-full h-full flex items-center justify-center'>

<div className="min-h-screen flex flex-col">
    <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="w-4 h-4"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg><span className="sr-only">Full Stack Developer</span></a><nav className="ml-auto flex gap-4 sm:gap-6"><a className="text-sm font-medium hover:underline underline-offset-4" href="#">
      About Me
    </a><a className="text-sm font-medium hover:underline underline-offset-4" href="#">
      Projects
    </a><a className="text-sm font-medium hover:underline underline-offset-4" href="#">
      Contact
    </a></nav></header><main className="flex-1"><section className="w-full h-screen flex items-center justify-center bg-[#ffffff] dark:bg-[#121212] text-center"><div className="space-y-10 xl:space-y-16"><h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-[3.75rem]">
        Welcome to my Portfolio
      </h1><p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
        I'm a Full Stack JavaScript Developer.
      </p><div className="space-x-4"><a className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300" href="#">
          View Projects
        </a></div></div></section><section className="w-full h-screen bg-[#f7f7f7] dark:bg-[#1c1c1c]"><div className="container space-y-12 px-4 md:px-6"><h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center">
        About Me
      </h2><div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3"><p className="text-sm text-gray-500 dark:text-gray-400">
          I am a Full Stack JavaScript Developer experienced in using technologies such as React, Next.js, Vite, Tailwind CSS, and Node.js. I have a passion for building interactive and dynamic web applications that provide a great user experience.
        </p><div className="grid gap-1"><h3 className="text-lg font-bold">
            Skills
          </h3><div className="flex flex-wrap gap-2"><div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">React</div><div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Next.js</div><div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Vite</div><div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Tailwind CSS</div><div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Node.js</div></div></div></div></div></section><section className="w-full h-screen bg-[#ffffff] dark:bg-[#121212]"><div className="container space-y-12 px-4 md:px-6"><h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center">
        Contact Me
      </h2><div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3"><div className="flex flex-col items-center space-y-4"><span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"><span className="flex h-full w-full items-center justify-center rounded-full bg-muted">JS</span></span><a className="text-sm font-medium hover:underline underline-offset-4" href="#">
            dev@example.com
          </a></div></div></div></section></main><footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"><p className="text-xs text-gray-500 dark:text-gray-400">
    ©  Full Stack Developer. All rights reserved.
  </p><nav className="sm:ml-auto flex gap-4 sm:gap-6"><a className="text-xs hover:underline underline-offset-4" href="#">
      Terms of Service
    </a><a className="text-xs hover:underline underline-offset-4" href="#">
      Privacy
    </a></nav></footer></div>
 </div>
);
}
