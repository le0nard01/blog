export const formatReadingTime = (minutes = 0) => {
	const cups = Math.round(minutes / Math.PI);
	if (cups > 4) {
		return `${new Array(Math.round(cups / Math.PI))
			.fill("🍱")
			.join("")} ${minutes} min de leitura`;
	} else {
		return `${new Array(cups || 1)
			.fill("☕️")
			.join("")} ${minutes} min de leitura`;
	}
};
