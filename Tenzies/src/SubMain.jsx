import React from 'react'
import { nanoid } from "nanoid";
import DieComp from './dieCom'
export default function SubMain(){

  function generateAllNewDice(){
    const arr=[]
    for(let i=0;i<10;i++){
        arr[i]={value:Math.floor(Math.random()*6)+1
          ,isHeld:false
          ,id: nanoid()
        }
    }
    return(
        arr
    )
}

function hold(id){
  setDieState (DieState=> DieState.map(die => {
            return die.id===id ? {...die, isHeld: !die.isHeld} :die
        }))
}

const [DieState,setDieState] = React.useState(generateAllNewDice);

const diceArr=DieState.map((e)=>{
   return <DieComp  key={e.id} id={e.id} value={e.value} isHeld={e.isHeld} hold={hold}/>
})

function suffelDice(){

  return(
    setDieState(oldDice => oldDice.map(die => 
            die.isHeld ?
                die :
                { ...die, value: Math.floor(Math.random() * 6)+1}
        ))
  )
}

    return(
        <section className="our-section">
        <section className="content">

          <section>
           <h1>TENIZIES</h1>
           <p>Roll until all dice are the same. 
            Click each die to freeze it at its current value between rolls.</p>
          </section>

          <section className="contianner">
                <div className="Box-contianner">
                   {diceArr}
                </div>

          </section>
         <div className="butt">
          <button onClick={suffelDice}>Roll</button>
         </div>
        </section>
        </section>
    )
}