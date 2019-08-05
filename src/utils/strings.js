export function formatReadingTime(minutes = 0) {
  let cups = Math.round(minutes / 5)
  let bowls = 0
  if (cups > 5) {
    return `${new Array(Math.round(cups / Math.E))
      .fill('🍱')
      .join('')} ${minutes} min de leitura`
  } else {
    return `${new Array(cups || 1)
      .fill('☕️')
      .join('')} ${minutes} min de leitura`
  }
}
