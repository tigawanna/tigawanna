export type SiteConfig = typeof siteConfig;

const links = [
  { label: "home", href: "#", route: "" },
  { label: "About", href: "#about", route: "about" },
  // { label: "Stats", href: "#stats", route: "stats" },
  { label: "Technologies", href: "#tech", route: "tech" },
  { label: "Projects", href: "#projects", route: "projects" },
  { label: "Working On", href: "#working_on", route: "working_on" },
  { label: "Journal", href: "#journal", route: "lessons" },
  { label: "Articles", href: "#articles", route: "articles" },
  { label: "Contact", href: "#contact", route: "contact" },
];

export const siteConfig = {
  name: "Dennis waweru",
  description: `Crafting exceptional web experiences with full-stack TypeScript and Go . 
	Proficient in Node.js, Deno, React, Next.js, Express, and HonoJS. 
	Fluent in backend technologies like Supabase, Firebase, and popular libraries such as TanStack, 
	Tailwind CSS, Apollo , Relay and other  GraphQL tooling and currently learning Golang
	 `,
  navItems: links,
  navMenuItems: links,
  links: {
    github: "https://github.com/tigawanna",
    linkedin: "https://linkedin.com/in/dennis-kinuthia-waweru",
    devto: "https://dev.to/tigawanna",
    nickname: "tigawanna",
    phone: "+254790984481",
    phoneDialer: "tel:+254790984481",
    email: "denniskinuthiawaweru@gmail.com",
    emailTo: "mailto:denniskinuthiawaweru@gmail.com",
    whatsappNumber: "+254790984481",
    whatsapp: "https://wa.me/254790984481",
    renderconke: "https://www.reactdevske.org",
    renderconke_talk:
      "https://docs.google.com/presentation/d/14q3-684ay5uK7Rhtp8ysj5ZVgCk_rsWsf7k9SFPHSKk/edit?usp=sharing",
    reactdevske: "https://www.reactdevske.org",
    reactdevske_01_2025_talk:
      "https://docs.google.com/presentation/d/1yFKSxNL-MHYddVMmt-dVi9wdlypw-aev2w7-I_O3aD0/edit?usp=sharing",
  },
} as const;

export const techSkills = [
  "React & Next.js",
  "TypeScript",
  "GraphQL",
  "Node.js",
  "Tailwind CSS",
  "React Native",
  "REST APIs",
  "Prisma & Drizzle",
  "TanStack",
  "Authentication",
  "State Management",
  "Testing",
  "CI/CD",
  "Performance Optimization",
  "Accessibility",
] as const
