export default function IngredientsList({ list, toggleRecipeShown }) {
  return (
    list.length > 0 && (
      <section>
        <h2>Ingredients on hand:</h2>
        <ul className="ingredients-list" aria-live="polite">{list}</ul>

        {list.length >= 3 && (
          <div className="get-recipe-container">
            <h3>Ready for a recipe?</h3>
            <button onClick={toggleRecipeShown}>Get a recipe</button>
          </div>
        )}
      </section>
    )
  );
}