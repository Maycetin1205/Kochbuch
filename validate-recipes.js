const fs=require('fs');
const vm=require('vm');
const path=require('path');

const context={console};
vm.createContext(context);
const source=fs.readFileSync('default-recipes.js','utf8');
vm.runInContext(`${source}\nthis.__recipes=DEFAULT_RECIPES;`,context,{filename:'default-recipes.js'});
vm.runInContext(fs.readFileSync('recipe-cleanup.js','utf8'),context,{filename:'recipe-cleanup.js'});

const recipes=context.__recipes;
const errors=[];
const ids=new Set();
const allowedStepKeys=new Set(['titel','aktion','startwert','tipp']);

if(!Array.isArray(recipes))errors.push('DEFAULT_RECIPES ist kein Array.');
else recipes.forEach((recipe,index)=>{
  const label=recipe?.titel||`Rezept ${index+1}`;
  if(!recipe||typeof recipe!=='object'||Array.isArray(recipe)){errors.push(`${label}: kein Objekt`);return;}
  if(!String(recipe.id||'').trim())errors.push(`${label}: id fehlt`);
  else if(ids.has(recipe.id))errors.push(`${label}: doppelte id ${recipe.id}`);
  else ids.add(recipe.id);
  if(!String(recipe.titel||'').trim())errors.push(`${label}: titel fehlt`);
  if(!String(recipe.kategorie||'').trim())errors.push(`${label}: kategorie fehlt`);
  const portions=Number(String(recipe.portionen??'').replace(',','.').match(/\d+(?:\.\d+)?/)?.[0]);
  if(!Number.isFinite(portions)||portions<=0)errors.push(`${label}: portionen ist ungültig`);
  if(recipe.publishedVersion!==undefined&&(!Number.isInteger(Number(recipe.publishedVersion))||Number(recipe.publishedVersion)<1))errors.push(`${label}: publishedVersion ist ungültig`);
  if(!Array.isArray(recipe.zutaten)||recipe.zutaten.length===0)errors.push(`${label}: Zutaten fehlen`);
  else recipe.zutaten.forEach((ingredient,i)=>{
    if(typeof ingredient==='string'){if(!ingredient.trim())errors.push(`${label}: Zutat ${i+1} ist leer`);return;}
    if(!ingredient||typeof ingredient!=='object'||!String(ingredient.name||'').trim())errors.push(`${label}: Zutat ${i+1} hat keinen Namen`);
  });
  if(!Array.isArray(recipe.schritte)||recipe.schritte.length===0)errors.push(`${label}: Schritte fehlen`);
  else recipe.schritte.forEach((step,i)=>{
    if(!step||typeof step!=='object')errors.push(`${label}: Schritt ${i+1} ist ungültig`);
    else{
      if(!String(step.aktion||'').trim())errors.push(`${label}: Schritt ${i+1} hat keine Anleitung`);
      for(const key of Object.keys(step))if(!allowedStepKeys.has(key))errors.push(`${label}: Schritt ${i+1} enthält unerlaubtes Feld ${key}`);
    }
  });
  if(recipe.bild&&String(recipe.bild).startsWith('./images/')){
    const file=path.resolve(String(recipe.bild).replace(/^\.\//,''));
    if(!fs.existsSync(file))errors.push(`${label}: Bilddatei fehlt (${recipe.bild})`);
  }
});

if(errors.length){
  console.error(`Rezeptprüfung fehlgeschlagen (${errors.length}):`);
  errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
}
console.log(`${recipes.length} Rezepte erfolgreich geprüft.`);