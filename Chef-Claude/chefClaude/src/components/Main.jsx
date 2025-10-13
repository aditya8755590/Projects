import React from "react"
export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);

    const ingredientsListItems = ingredients.map(ingredient => (
        <li key={ingredient}>{ingredient}</li>
    ))
    function handleSubmit(event) {
        event.preventDefault();
         const formData = new FormData(event.currentTarget)
         const newIngredient = formData.get("ingredient")
        setIngredients([...ingredients, newIngredient]);
    }
  return (
    <main className="main">
      <h2>Welcome to Chef Claude's Kitchen</h2>
      <p>Discover delicious recipes and cooking tips.</p>
      <form className="search" onSubmit={handleSubmit}>
        <input
        type="text" 
        placeholder="eg .tomato" 
        name="ingredient"
        />
        <button>Add ingredient</button>
      </form>
      <div className="items">
         <ul>
        {ingredientsListItems}
      </ul>
      </div>
    </main>
  )
}
