import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from  './views/searchView';
import * as recipeView from  './views/recipeView';
import {elements, renderLoader, clearLoader } from './views/base';
import * as listView from './views/ListView';
import Likes from './models/Likes';
import * as likesView from './views/likesView';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

const controlSearch=async ()=>{
    //1. Get query from the view.
    const query=searchView.getInput();//TODO
    console.log(query);
   
    if(query){
        
        //2. New search object and add it to state.
        state.search=new Search(query);
        //3. Prepare UI for results.
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResList);
        try{
        //4. Search for recipes.
        await state.search.getResults();
        //5. Render results on UI.
        clearLoader();
        searchView.renderResults(state.search.result);
        }catch(err){
            alert('Something wrong with the search');
        }
        
    }
};
//EventListeners.
elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click',e=>{
    const btn=e.target.closest('.btn-inline');
    if(btn){
        const goToPage=parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe=async ()=>{
    //get id from url
    const id=window.location.hash.replace('#','');
    console.log(id);
    if(id){
        recipeView.clearRecipe();
        if(state.search){
            searchView.hightlightSelected(id);
        }
        //preparing UI for changes
        renderLoader(elements.recipe);
        //Create new recipe object
        state.recipe=new Recipe(id);
        //Get recipe object
        try{
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        //Caculate servings and time
        state.recipe.calculateTime();
        state.recipe.calculateServings();
        //render recipe
        console.log(id)
        console.log(state.recipe);
        clearLoader();
        recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
        }catch(error){
            alert(error);
        }

    }
}

['hashchange'].forEach(event=>window.addEventListener(event,controlRecipe));

//handle /delete/update shopping list.
elements.shopping.addEventListener('click',e=>{
    const id=e.target.closest('.shopping__item').dataset.itemid;
    //delete.
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        //delete from ui.
        listView.deleteItem(id);

    }else if(e.target.matches('shopping__count-value')){
        const val=parseFloat(e.target.value,10);
        state.list.updateCount(id,  val);
    }
});
//Handling recipe button clicks.
elements.recipe.addEventListener('click',e=>{
   if(e.target.matches('.btn-decrease, .btn-decrease *')){
       if(state.recipe.servings>1){
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
       }
   }else if(e.target.matches('.btn-increase, .btn-increase *')){
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
   }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
       controlList();
   }else if(e.target.matches('.recipe__love, .recipe__love *')){
       //Like controler.
       controlLike();
   }
});

/**
 * LIST CONTROLLER
 */
const controlList=()=>{
    //Create if not already.
    if(!state.list) {
        state.list=new List();
    }
    //Add each ingredient to list.
    state.recipe.ingredients.forEach(el=>{
            const item=state.list.addItem(el.count,el.unit, el.ingredient);
            listView.renderItem(item);
    });
}

/**
 * LIKE CONTROLLER.
 */
const controlLike =()=>{
    if(!state.likes)
        state.likes=new Likes();
    const currentId=state.recipe.id;

    if(!state.likes.isLiked(currentId)){
        //add like to state.
        const newLike=state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);

    }else{
            state.likes.deleteLike(currentId);
            likesView.toggleLikeBtn(false);
            likesView.deleteLike(currentId);
    }

   
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

/**
 * Page load.
 */
window.addEventListener('load',()=>{
    state.likes=new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like=>likesView.renderLike(like));
})
 