import React from "react"
import IngredientsList from "./IngredientsList"
import Myform from "./form"
export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const ingredientsListItems = ingredients.map(ingredient => (
    <li key={ingredient}>{ingredient}</li>
  ))

  function additems(formData) {
    // event.preventDefault();
    // we can get the form data using formData object

    // const formData = new FormData(e.target);
    // get the value of the input field using formData.get("name of the input field")
    const newIngredient = formData.get("ingredient")
    setIngredients([...ingredients, newIngredient]);
    // this is to clear the input field after submission
    //    ye ise apne aap kar dega agar action m function use karenge
    //  formData.reset();
  }
  return (
    <main className="main">
      <h2>Welcome to Chef Claude's Kitchen</h2>
      <p>Discover delicious recipes and cooking tips.</p>
       {/* these components were degine my me  */}
      <Myform  additems={additems}/>
      <IngredientsList  list={ingredientsListItems}/>
      </main>
  )
}
