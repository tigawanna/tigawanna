import Link from "next/link";

export default function OneRepoLayout({
	children,
}: { children: React.ReactNode }) {
	const links = [
		{ label: "repo", href: "#", route: "" },
		{ label: "readme", href: "#readme", route: "readme" },
		{ label: "stackblitz", href: "#stackblitz", route: "stackblitz" },
	];
	return (
		<main className="p-0 m-0">
			<div className="w-full sticky top-0 flex justify-center z-50">
				<ul className="w-fit flex gap-3 p-2 items-center justify-center bg-transparent glass rounded-xl ">
					{links.map((link) => (
						<li key={link.label + link.route}>
							<Link
								key={link.label}
								href={link.href}
								className="hover:text-secondary  px-3  text-base font-semibold "
							>
								{link.label}
							</Link>
						</li>
					))}
				</ul>
			</div>
			{children}
		</main>
	);
}
