import React from "react"
export default function form(props){

    return (
        // we use action insted of onsubmmit
      <form className="search" action={props.additems}>
        <input
          type="text"
          placeholder="eg .tomato"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>

    )
}