export const formatReadingTime = (minutes = 0) => {
	const cups = Math.round(minutes / 5);
	if (cups > 3) {
		return `${new Array(Math.round(cups / Math.E))
			.fill("🍱")
			.join("")} ${minutes} min de leitura`;
	} else {
		return `${new Array(cups || 1)
			.fill("☕️")
			.join("")} ${minutes} min de leitura`;
	}
};
