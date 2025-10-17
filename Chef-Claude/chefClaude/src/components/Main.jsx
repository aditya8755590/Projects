import React from "react"
export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);

  const ingredientsListItems = ingredients.map(ingredient => (
    <li key={ingredient}>{ingredient}</li>
  ))
  function additems(formData) {
    // we dont need to prevent default as react will handle it
    // e.preventDefault();
    // we can get the form data using formData object
    // const formData = new FormData(e.target);
    // get the value of the input field using formData.get("name of the input field")
    const newIngredient = formData.get("ingredient")
    setIngredients([...ingredients, newIngredient]);
    //   // this is to clear the input field after submission
    // ye ise apne aap kar dega agar action m function use karenge
    //  formData.reset();


  }
  return (
    <main className="main">
      <h2>Welcome to Chef Claude's Kitchen</h2>
      <p>Discover delicious recipes and cooking tips.</p>
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
        </div> }
      </section>}
    </main>
  )
}
