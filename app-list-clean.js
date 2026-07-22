recipesView=function compactRecipesView(favoritesOnly=false){
  const categories=[...new Set(state.recipes.map(r=>r.kategorie))].sort((a,b)=>a.localeCompare(b,'de'));
  const base=favoritesOnly?state.recipes.filter(r=>isFavorite(r.id)):state.recipes;
  const list=filteredRecipes(base);
  return `<div class="toolbar recipe-toolbar"><div class="search"><input id="searchInput" value="${esc(state.query)}" placeholder="Rezepte und Zutaten suchen"></div><select id="categoryFilter"><option value="">Alle Kategorien</option>${categories.map(c=>`<option ${state.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select><button class="btn" data-view="import">Rezept hinzufügen</button></div>${list.length?`<div class="grid">${list.map(recipeCard).join('')}</div>`:`<div class="empty"><p>${favoritesOnly?'Noch keine Favoriten.':'Keine passenden Rezepte gefunden.'}</p></div>`}`;
};