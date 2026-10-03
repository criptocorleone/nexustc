async function run() {
  const res = await fetch('https://nexustc.com.br/assets/index-BGkrpM1v.js');
  const js = await res.text();
  
  // Find where `ib=` starts
  const arrayStart = js.indexOf('ib=[');
  if (arrayStart === -1) {
    console.log('ib=[ not found');
    return;
  }
  console.log('Found ib=[ at position:', arrayStart);
  
  // Print 2000 chars of the array
  console.log(js.substring(arrayStart, arrayStart + 2000));
}

run().catch(console.error);
