import './App.css'
import Header from './components/Header.jsx'
import Entry from './components/Entry.jsx'
import data from './data.js'
export default function App() {
  const entries = data.map(itms=> (
    <Entry 
      // key={item.id}
      // img={item.img}
      // title={item.title}
      // country={item.country}
      // dates={item.dates}
      // text={item.text}
      // googleMapsLink={item.googleMapsLink}
      // key={Entry.id}
      // ye dusra tarika hai pass karne ka 
      // we can't take another name insted of entry 
      // we can take any name but we have to use the same name while using it in Entry component
      key={itms.id}
      // item={entry} --- IGNORE ---
      // item={itms}
      // we can also use spread operator
      // {...item} --- IGNORE --
      {...itms}
    />
  ))
  return (
    <>
    <Header/>
    {entries}
    </>
  )
}
