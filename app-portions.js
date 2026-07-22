state.portionsByRecipe = {};
idbGet('portionSelections').then(value => {
  if (value && typeof value === 'object') state.portionsByRecipe = value;
}).catch(() => {});

function basePortions(recipe) {
  const match = String(recipe?.portionen ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
  const value = match ? Number(match[0]) : 1;
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function selectedPortions(recipe) {
  const saved = Number(state.portionsByRecipe?.[recipe.id]);
  return Number.isFinite(saved) && saved > 0 ? saved : basePortions(recipe);
}

function formatAmount(value) {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 100) / 100;
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(rounded);
}

function fractionValue(raw) {
  const text = String(raw).trim().replace(',', '.');
  const unicode = { '¼': .25, '½': .5, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': .125, '⅜': .375, '⅝': .625, '⅞': .875 };
  if (unicode[text] !== undefined) return unicode[text];
  const mixedUnicode = text.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/);
  if (mixedUnicode) return Number(mixedUnicode[1]) + unicode[mixedUnicode[2]];
  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed && Number(mixed[3])) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction && Number(fraction[2])) return Number(fraction[1]) / Number(fraction[2]);
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function scaleAmount(raw, factor) {
  if (raw === null || raw === undefined || raw === '') return raw ?? '';
  if (typeof raw === 'number') return formatAmount(raw * factor);
  const text = String(raw).trim();
  const range = text.match(/^(.+?)\s*([–-])\s*(.+)$/);
  if (range) {
    const left = fractionValue(range[1]);
    const right = fractionValue(range[3]);
    if (left !== null && right !== null) return `${formatAmount(left * factor)}${range[2]}${formatAmount(right * factor)}`;
  }
  const value = fractionValue(text);
  return value === null ? text : formatAmount(value * factor);
}

function scaleLeadingAmount(text, factor) {
  const source = String(text ?? '');
  const match = source.match(/^\s*((?:\d+\s+\d+\/\d+)|(?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?)|[¼½¾⅓⅔⅛⅜⅝⅞])(?:\s*([–-])\s*((?:\d+\/\d+)|(?:\d+(?:[.,]\d+)?)))?/);
  if (!match) return source;
  const original = match[0];
  let replacement;
  if (match[2] && match[3]) {
    replacement = `${scaleAmount(match[1], factor)}${match[2]}${scaleAmount(match[3], factor)}`;
  } else {
    replacement = scaleAmount(match[1], factor);
  }
  return replacement + source.slice(original.length);
}

function scaledIngredientText(ingredient, recipe) {
  const factor = selectedPortions(recipe) / basePortions(recipe);
  if (typeof ingredient === 'string') return scaleLeadingAmount(ingredient, factor);
  const amount = scaleAmount(ingredient?.menge, factor);
  return [amount, ingredient?.einheit, ingredient?.name]
    .filter(value => value !== undefined && value !== null && String(value).trim())
    .join(' ') + (ingredient?.hinweis ? ` · ${ingredient.hinweis}` : '');
}

async function setPortions(recipe, value) {
  const next = Math.max(1, Math.min(99, Math.round(Number(value) || basePortions(recipe))));
  state.portionsByRecipe[recipe.id] = next;
  await idbSet('portionSelections', state.portionsByRecipe);
  render();
}

const originalBindViewForPortions = bindView;
bindView = function bindViewWithPortions() {
  originalBindViewForPortions();
  const recipe = current();
  if (!recipe) return;
  $('#portionMinus')?.addEventListener('click', () => setPortions(recipe, selectedPortions(recipe) - 1));
  $('#portionPlus')?.addEventListener('click', () => setPortions(recipe, selectedPortions(recipe) + 1));
  $('#portionInput')?.addEventListener('change', event => setPortions(recipe, event.target.value));
  $('#portionReset')?.addEventListener('click', async () => {
    delete state.portionsByRecipe[recipe.id];
    await idbSet('portionSelections', state.portionsByRecipe);
    render();
  });
};

addRecipeToShopping = async function addScaledRecipeToShopping(id) {
  const recipe = state.recipes.find(item => item.id === id);
  if (!recipe) return;
  const portions = selectedPortions(recipe);
  const items = (recipe.zutaten || [])
    .map(ingredient => ({
      id: uid('s'),
      text: scaledIngredientText(ingredient, recipe),
      checked: false,
      recipeId: recipe.id,
      recipeTitle: `${recipe.titel} · ${portions} Portionen`
    }))
    .filter(item => item.text.trim());
  state.shopping.push(...items);
  await idbSet('shopping', state.shopping);
  toast(`${items.length} Zutaten für ${portions} Portionen hinzugefügt`);
};

detailView = function detailViewWithPortions() {
  const recipe = current();
  if (!recipe) return recipesView();
  const checked = state.checkedIngredients[recipe.id] || {};
  const portions = selectedPortions(recipe);
  const original = basePortions(recipe);
  return `<div class="toolbar"><button class="btn ghost" data-view="recipes">← Rezepte</button></div><section class="detail-head"><div class="detail-photo">${imgHtml(recipe.bild,recipe.titel)}</div><div class="detail-info"><div class="eyebrow">${esc(recipe.kategorie)}</div><h1>${esc(recipe.titel)}</h1><div class="meta">${[recipe.schwierigkeit,recipe.zeitGesamt].filter(Boolean).map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div><div class="portion-box"><span class="portion-label">Menge für</span><button class="portion-button" id="portionMinus" aria-label="Eine Portion weniger">−</button><input id="portionInput" type="number" min="1" max="99" step="1" value="${portions}" aria-label="Portionen"><button class="portion-button" id="portionPlus" aria-label="Eine Portion mehr">+</button><span class="portion-unit">Portionen</span>${portions!==original?'<button class="portion-reset" id="portionReset">Originalmenge</button>':''}</div>${recipe.quelle?`<a class="source-link" href="${esc(recipe.quelle)}" target="_blank" rel="noopener">↗ ${esc(recipe.quelleName||'Originalquelle öffnen')}</a>`:''}<p class="intro">${esc(recipe.einleitung)}</p><div class="card-actions detail-actions"><button class="btn primary" id="startCook">Kochmodus</button><button class="btn" id="detailFavorite">${isFavorite(recipe.id)?'♥ Favorit':'♡ Favorit'}</button><button class="btn secondary" id="detailCart">Zutaten zur Einkaufsliste</button><label class="btn file-label">${recipe.bild?'Bild ändern':'Eigenes Bild wählen'}<input id="detailImageFile" type="file" accept="image/*"></label>${recipe.bild?'<button class="btn" id="removeImage">Bild entfernen</button>':''}<button class="btn danger" id="deleteRecipe">Löschen</button></div><div class="hint" style="margin-top:12px">Die Zutaten sind auf ${portions} Portionen berechnet. Angaben wie „nach Geschmack“ bleiben unverändert.</div></div></section><section class="recipe-layout"><aside class="ingredients"><h2>Zutaten · ${portions} Portionen</h2>${(recipe.zutaten||[]).map((ingredient,index)=>`<label class="ingredient ${checked[index]?'checked':''}"><input type="checkbox" data-ing="${index}" ${checked[index]?'checked':''}><span>${esc(scaledIngredientText(ingredient,recipe))}${ingredient?.optional?' <small>(optional)</small>':''}</span></label>`).join('')||'<p class="hint">Keine Zutaten hinterlegt.</p>'}${recipe.werkzeuge?.length?`<h3 style="margin-top:24px">Werkzeuge</h3><div class="tools">${recipe.werkzeuge.map(x=>`<span class="badge">${esc(x)}</span>`).join('')}</div>`:''}${recipe.tipps?.length?`<h3 style="margin-top:24px">Tipps</h3><ul>${recipe.tipps.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</aside><article class="steps"><h2>Zubereitung</h2>${recipe.schritte.map(stepHtml).join('')}</article></section>`;
};
