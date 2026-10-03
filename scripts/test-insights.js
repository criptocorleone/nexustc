async function test() {
  const res = await fetch('http://localhost:4321/insights');
  console.log('Insights status:', res.status);
  const text = await res.text();
  const cardTitles = [...text.matchAll(/class="ds-card__title"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].trim());
  console.log(`Total cards on /insights: ${cardTitles.length}`);
  cardTitles.forEach((t, i) => console.log(`${i+1}. ${t}`));
}
test().catch(console.error);
