export type SiteConfig = typeof siteConfig;

const links = [
	{ label: "home", href: "#", route: "" },
	{ label: "About", href: "#about", route: "about" },
	{ label: "Ibuild", href: "#ibuild", route: "ibuild" },
	{ label: "Stats", href: "#stats", route: "stats" },

	{ label: "Projects", href: "#projects", route: "projects" },
	{ label: "Contact", href: "#contact", route: "contact" },
]

export const siteConfig = {
	name: "Dennis Kinuthia",
	description: `Crafting exceptional web experiences with a full-stack JavaScript and TypeScript 
	toolkit. 
	Proficient in Node.js, Deno, React, Next.js, Express, and HonoJS. 
	Fluent in backend technologies like Supabase, Firebase, and popular libraries such as TanStack, 
	Tailwind CSS, Apollo , Relay and other  GraphQL tooling
	 `,
	navItems: links,
	navMenuItems: links,
	links: {
	twitter: "https://twitter.com/betterblocks",
	facebook: "https://facebook.com/betterblocks",
	instagram: "https://instagram.com/betterblocks",
	whatsapp: "https://whatsapp.com",
	email: "betterblocks.com",
}
	,
} as const
