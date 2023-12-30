export type SiteConfig = typeof siteConfig;

const links = [
	{
		name: "Home",
		href: "#",
	},
	{
		name: "About",
		href: "#about",
	},
	{
		name: "Ibuild",
		href: "#ibuild",
	},
	{
		name: "Stats",
		href: "#stats",
	},
	{
		name: "Projects",
		href: "#projects",
	},
	{
		name: "Contact",
		href: "#contact",
	},
]

export const siteConfig = {
	name: "Better Blocks",
	description: "Your premium property discovery platform",
	navItems: [
		{	label: "home",	href: "#"},
		{	label: "About",	href: "#about"},
		{	label: "Ibuild",	href: "#ibuild"},
		{	label: "Stats",	href: "#stats"},
		{	label: "Projects",	href: "#projects"},
		{	label: "Contact",	href: "#contact"},
	],
	navMenuItems: [
		{ label: "home", href: "#" },
		{ label: "About", href: "#about" },
		{ label: "Ibuild", href: "#ibuild" },
		{ label: "Stats", href: "#stats" },
		{ label: "Projects", href: "#projects" },
		{ label: "Contact", href: "#contact" },
	
	],
	links: {
	twitter: "https://twitter.com/betterblocks",
	facebook: "https://facebook.com/betterblocks",
	instagram: "https://instagram.com/betterblocks",
	whatsapp: "https://whatsapp.com",
	email: "betterblocks.com",
}
	,
};
