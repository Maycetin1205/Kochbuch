function recipeCard(r){
  return `<article class="card"><div class="card-img">${imgHtml(r.bild,r.titel)}<span class="badge">${esc(r.kategorie)}</span><button class="heart ${isFavorite(r.id)?'active':''}" data-favorite="${esc(r.id)}" aria-label="Favorit">${isFavorite(r.id)?'♥':'♡'}</button></div><div class="card-body"><h3>${esc(r.titel)}</h3><div class="meta">${r.schwierigkeit?`<span>${esc(r.schwierigkeit)}</span>`:''}${r.zeitGesamt?`<span>· ${esc(r.zeitGesamt)}</span>`:''}${r.portionen?`<span>· ${esc(r.portionen)} Portionen</span>`:''}</div><p>${esc((r.einleitung||'').slice(0,135))}${(r.einleitung||'').length>135?'…':''}</p><div class="card-actions"><button class="btn primary" data-open="${esc(r.id)}">Öffnen</button></div></div></article>`;
}

function recipesView(favoritesOnly=false){
  const categories=[...new Set(state.recipes.map(r=>r.kategorie))].sort((a,b)=>a.localeCompare(b,'de'));
  const base=favoritesOnly?state.recipes.filter(r=>isFavorite(r.id)):state.recipes;
  const list=filteredRecipes(base);
  return `<div class="toolbar recipe-toolbar"><div class="search"><input id="searchInput" value="${esc(state.query)}" placeholder="Rezepte und Zutaten suchen"></div><select id="categoryFilter"><option value="">Alle Kategorien</option>${categories.map(c=>`<option ${state.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><button class="btn" data-view="import">Rezept hinzufügen</button></div>${list.length?`<div class="grid">${list.map(recipeCard).join('')}</div>`:`<div class="empty"><p>${favoritesOnly?'Noch keine Favoriten.':'Keine passenden Rezepte gefunden.'}</p></div>`}`;
}

function categoriesView(){
  const counts={};
  state.recipes.forEach(r=>counts[r.kategorie]=(counts[r.kategorie]||0)+1);
  const entries=Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0],'de'));
  return `<div class="category-grid">${entries.map(([name,count])=>`<button class="category-card" data-category="${esc(name)}"><strong>${esc(name)}</strong><span>${count}</span></button>`).join('')}</div>`;
}

function aiPrompt(source=''){
  return `Arbeite direkt in meinem verbundenen GitHub-Repository Maycetin1205/Kochbuch.

Lies zuerst RECIPE_IMPORT_INSTRUCTIONS.md vollständig.

Ich sende dir ein Rezept und mein eigenes Foto. Trage das Rezept direkt in default-recipes.js ein und speichere mein Foto unter images/. Verwende pro Zubereitungsschritt nur: titel, aktion, optional startwert und optional tipp. Keine Sinnesfelder, keine Warum-Erklärungen und keine Fehlerkästen. Prüfe die Datei und committe direkt auf main. Gib nicht nur JSON aus. Falls du keinen Schreibzugriff hast, sage das sofort.

Rezept oder Quelle:
${source||'[Rezept und Foto folgen]'}`;
}

function importView(){
  return `<div class="two-col"><section class="panel"><h2>Rezept mit ChatGPT hinzufügen</h2><div class="field"><textarea id="aiSource" placeholder="Rezepttext oder Link"></textarea></div><button class="btn primary" id="openAI" style="margin-top:14px">Rezeptchat öffnen</button></section><section class="panel"><h2>Von URL</h2><div class="field"><input id="urlInput" type="url" placeholder="https://…"></div><button class="btn secondary" id="urlImport" style="margin-top:14px">Importieren</button></section></div><section class="panel"><h2>JSON oder Backup</h2><div class="field"><textarea id="jsonArea" placeholder='{"titel":"…","zutaten":[…],"schritte":[…]}'></textarea></div><div class="card-actions" style="margin-top:14px"><label class="btn file-label">Datei wählen<input id="jsonFile" type="file" accept=".json,application/json,text/plain"></label><button class="btn primary" id="importBtn">Importieren</button><button class="btn" id="exportBtn">Backup</button></div>${state.message?`<div class="notice ${state.messageType}">${esc(state.message)}</div>`:''}</section>`;
}

function detailView(){
  const r=current();
  if(!r)return recipesView();
  const checked=state.checkedIngredients[r.id]||{};
  return `<div class="toolbar"><button class="btn ghost" data-view="recipes">← Rezepte</button></div><section class="detail-head"><div class="detail-photo">${imgHtml(r.bild,r.titel)}</div><div class="detail-info"><div class="eyebrow">${esc(r.kategorie)}</div><h1>${esc(r.titel)}</h1><div class="meta">${[r.schwierigkeit,r.zeitGesamt,r.portionen?`${r.portionen} Portionen`:'' ].filter(Boolean).map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div>${r.quelle?`<a class="source-link" href="${esc(r.quelle)}" target="_blank" rel="noopener">Quelle öffnen</a>`:''}<p class="intro">${esc(r.einleitung)}</p><div class="card-actions detail-actions"><button class="btn primary" id="startCook">Kochmodus</button><button class="btn" id="detailFavorite">${isFavorite(r.id)?'♥ Favorit':'♡ Favorit'}</button><label class="btn file-label">${r.bild?'Bild ändern':'Bild wählen'}<input id="detailImageFile" type="file" accept="image/*"></label>${r.bild?'<button class="btn" id="removeImage">Bild entfernen</button>':''}<button class="btn danger" id="deleteRecipe">Löschen</button></div></div></section><section class="recipe-layout"><aside class="ingredients"><h2>Zutaten</h2>${(r.zutaten||[]).map((z,i)=>`<label class="ingredient ${checked[i]?'checked':''}"><input type="checkbox" data-ing="${i}" ${checked[i]?'checked':''}><span>${esc(ingredientText(z))}${z?.optional?' <small>(optional)</small>':''}</span></label>`).join('')||'<p>Keine Zutaten.</p>'}</aside><article class="steps"><h2>Zubereitung</h2>${r.schritte.map(stepHtml).join('')}</article></section>`;
}

function stepTip(step){return String(step?.tipp||step?.tip||step?.fertigWenn||'').trim()}
function stepHtml(s,i){
  const tip=stepTip(s);
  return `<section class="step"><div><span class="step-num">${i+1}</span><h3>${esc(s.titel||`Schritt ${i+1}`)}</h3></div>${s.startwert?`<div class="meta" style="margin-top:8px"><span class="badge">${esc(s.startwert)}</span></div>`:''}<p class="action">${esc(s.aktion)}</p>${tip?`<div class="step-tip"><strong>Tipp:</strong> ${esc(tip)}</div>`:''}</section>`;
}

function cookView(){
  const r=current();
  if(!r)return recipesView();
  const i=Math.max(0,Math.min(r.schritte.length-1,state.cookStep));
  const s=r.schritte[i];
  const tip=stepTip(s);
  const pct=((i+1)/r.schritte.length)*100;
  return `<div class="cook-wrap"><div class="toolbar"><button class="btn ghost" id="exitCook">← Rezept</button><span class="badge">${i+1} / ${r.schritte.length}</span></div><div class="progress"><span style="width:${pct}%"></span></div><article class="cook-card"><h1>${esc(s.titel||`Schritt ${i+1}`)}</h1>${s.startwert?`<span class="badge">${esc(s.startwert)}</span>`:''}<p class="action" style="font-size:21px;margin-top:22px">${esc(s.aktion)}</p>${tip?`<div class="step-tip"><strong>Tipp:</strong> ${esc(tip)}</div>`:''}<div class="cook-nav"><button class="btn" id="prevStep" ${i===0?'disabled':''}>← Zurück</button><button class="btn primary" id="nextStep">${i===r.schritte.length-1?'Fertig':'Weiter →'}</button></div></article></div>`;
}

function render(){
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  const views={recipes:()=>recipesView(false),favorites:()=>recipesView(true),categories:categoriesView,import:importView,detail:detailView,cook:cookView};
  $('#app').innerHTML=(views[state.view]||views.recipes)();
  bindView();
}