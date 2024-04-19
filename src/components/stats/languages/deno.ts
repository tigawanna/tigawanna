export async function getGithubViewerLanguages() {
	try {
		const deno_url = process.env.DENO_URL;
		const pat = process.env.GH_PAT;

		if (!deno_url || !pat) return;
		const langs = (await fetch(deno_url + "/stats/langs", {
			headers: {
				Authorization: `${pat}`,
			},
		})
			.then((res) => {
				// // no(" get langs resonse == ",res.statusText)
				if (!res.ok) {
					throw new Error(res.statusText);
				}
				return res.json();
			})
			.then((data) => data?.language_stats?.value)) as Record<
			string,
			{ color: string; count: number }
		>;

		const langsTotalCount = Object.values(langs).reduce(
			(a, b) => a + b.count,
			0,
		);
		const standard_langs = Object.entries(langs)
			.map(([key, value]) => {
				return {
					name: key,
					color: value.color,
					percentage: Math.max(
						Math.floor((value.count / langsTotalCount) * 100),
						-1,
					),
				};
			})
			.sort((a, b) => b.percentage - a.percentage);

		return standard_langs;
	} catch (error: any) {
		// no("====== Error ========  ",error.message)
		return;
	}
}
