for(const recipe of DEFAULT_RECIPES){
  if(!Array.isArray(recipe.schritte))continue;
  recipe.schritte=recipe.schritte.map(step=>{
    if(typeof step==='string')return{titel:'',aktion:step,startwert:'',tipp:''};
    return{
      titel:String(step?.titel||''),
      aktion:String(step?.aktion||step?.text||''),
      startwert:String(step?.startwert||''),
      tipp:String(step?.tipp||step?.tip||'')
    };
  });
}