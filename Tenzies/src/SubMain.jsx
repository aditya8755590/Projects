import React from 'react'
import { nanoid } from "nanoid";
import DieComp from './dieCom'
import Confetti from 'react-confetti'

export default function SubMain(){
const [DieState,setDieState] = React.useState(()=>generateAllNewDice());
const buttonRef = React.useRef(null)
let gameWon=(AlldiceHeld()&&HadSameValue())

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

const diceArr=DieState.map((e)=>{
   return <DieComp  key={e.id} id={e.id} value={e.value} isHeld={e.isHeld} hold={hold}/>
})
// for focous on the new game button 
React.useEffect(() => {
        if (gameWon) {
            buttonRef.current.focus()
        }
    }, [gameWon])

function suffelDice(){
  // but if new game is  clicked 
  if(gameWon){
    //  setDieState(oldDice => oldDice.map(die => 
    //         ({ ...die, isHeld:false,value: Math.floor(Math.random() * 6)+1})
    //     ))
    // or we use 
    setDieState(generateAllNewDice())

  }
  return(
    setDieState(oldDice => oldDice.map(die => 
            die.isHeld ? die : ({ ...die, value: Math.floor(Math.random() * 6)+1})
        ))
  )
}   
    function AlldiceHeld(){
        return (
            DieState.every((dic)=>dic.isHeld)
            )
        
    }
    function HadSameValue(){
        const a=DieState[0].value;
        return (
            DieState.every((dic)=>dic.value===a)
            )
          }

    return(
        <section className="our-section">
        <section className="content">
         {gameWon && <Confetti />}
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
          <button ref={buttonRef} onClick={suffelDice} >{gameWon?"New game":"Roll"}</button>
         </div>
        </section>
        </section>
    )
}