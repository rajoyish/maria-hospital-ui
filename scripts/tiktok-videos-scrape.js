(async () => {
  const u = window.location.pathname.split('/')[1];
  if (!u || !u.startsWith('@')) return console.log("❌ Profile not found.");
  
  const s = new Set();
  let c = 0, z = 0;
  
  while (c < 15) {
    document.querySelectorAll(`a[href*="${u}/video/"]`).forEach(a => {
      const m = a.href.match(/\/video\/(\d+)/);
      if (m) s.add(`https://www.tiktok.com/${u}/video/${m[1]}`);
    });
    
    window.scrollBy(0, window.innerHeight);
    await new Promise(r => setTimeout(r, 400));
    
    c = s.size === z ? c + 1 : 0;
    z = s.size;
    console.log(`Collected: ${z}`);
  }
  
  if (!z) return console.log("❌ No links.");
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([[...s].join("\n")], { type: "text/plain" }));
  a.download = `${u.slice(1)}_videos.txt`;
  a.click();
  console.log("✅ Done!");
})();