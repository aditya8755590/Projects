export default function ClaudeRecipe({ recipeText }) {
  return (
    <section className="recipe-section">
      <h3>🍲 Chef Claude’s Recipe</h3>
      <p>{recipeText}</p>
    </section>
  );
}