import React, { useState } from "react";
import IngredientsList from "./IngredientsList";
import Myform from "./form";
import ClaudeRecipe from "./claudeRecipe";

export default function Main() {
  const [ingredients, setIngredients] = useState([]);
  const [recipeShown, setRecipeShown] = useState(false);
  const [recipeText, setRecipeText] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleRecipeShown() {
    setRecipeShown((prev) => !prev);
  }

  function additems(formData) {
    const newIngredient = (formData.get("ingredient") || "").trim();
    if (!newIngredient) return;
    setIngredients((prev) => [...prev, newIngredient]);
  }

  async function handleGenerate() {
  if (ingredients.length === 0) return;

  try {
    const response = await fetch("http://localhost:5001/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    if (Array.isArray(data) && data[0]?.generated_text) {
      setRecipeText(data[0].generated_text);
    } else if (data.generated_text) {
      setRecipeText(data.generated_text);
    } else if (data.error) {
      setRecipeText("Error from backend: " + data.error);
      console.log("Raw backend data:", data.raw);
    } else {
      setRecipeText("No recipe generated. Check console for data.");
      console.log("Raw data:", data);
    }

  } catch (err) {
    console.error("Error fetching recipe:", err);
    setRecipeText("Error connecting to server.");
  }
}
  return (
    <main className="main">
      <h2>Welcome to Chef Claude's Kitchen</h2>
      <p>Discover delicious recipes and cooking tips.</p>
<<<<<<< HEAD

      <Myform additems={additems} />

      <IngredientsList
        list={ingredients.map((i) => <li key={i}>{i}</li>)}
        toggleRecipeShown={handleGenerate} // ⚡ call handleGenerate on button click
      />

      {recipeShown && <ClaudeRecipe recipeText={recipeText} />}
      {loading && <p>Generating recipe...</p>}
=======
      {/* we use action insted of onsummbit  */}
      <form className="search" action={additems}>
        <input
          type="text"
          placeholder="eg .tomato"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>
      {/* <div className="items">
        <ul>
          {ingredientsListItems}
        </ul>
      </div> */}
      {ingredientsListItems.length>0&&<section>
        <h2>Ingredients on hand:</h2>
        <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
        { ingredientsListItems.length>=3&&<div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button>Get a recipe</button>
        </div> 
        }
      </section>
      }
>>>>>>> 0272d2d8139c9b327beb9b7d83d000c6f9a5052b
    </main>
  );
}