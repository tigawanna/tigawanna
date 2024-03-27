export type SiteConfig = typeof siteConfig;

const links = [
  { label: "home", href: "#", route: "" },
  { label: "About", href: "#about", route: "about" },
  { label: "I build", href: "#ibuild", route: "ibuild" },
  { label: "Stats", href: "#stats", route: "stats" },
  { label: "Technologies", href: "#tech", route: "tech" },
  { label: "Projects", href: "#projects", route: "projects" },
  { label: "Working On", href: "#working_on", route: "working_on" },
  { label: "Articles", href: "#articles", route: "articles" },
  { label: "Contact", href: "#contact", route: "contact" },
];

export const siteConfig = {
  name: "Dennis Kinuthia",
  description: `Crafting exceptional web experiences with full-stack JavaScript and TypeScript . 
	Proficient in Node.js, Deno, React, Next.js, Express, and HonoJS. 
	Fluent in backend technologies like Supabase, Firebase, and popular libraries such as TanStack, 
	Tailwind CSS, Apollo , Relay and other  GraphQL tooling
	 `,
  navItems: links,
  navMenuItems: links,
  links: {
    twitter: "https://twitter.com/tigawanna",
    github: "https://github.com/tigawanna",
    linkedin: "https://linkedin.com/in/dennis-kinuthia-waweru",
    devto: "https://dev.to/tigawanna",
    nickname: "tigawanna",
    phone: "+254790984481",
    email: "denniskinuthiawaweru@gmail.com",
    whatsapp: "https://wa.me/254790984481",
  },
} as const;
