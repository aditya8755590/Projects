import globe from '../assets/globe.png'

export default function Header() {
  return (
    <header className="header">
     <img src={globe} alt="Globe" />
     <span>My Travel Journal</span>
    </header>
  )
}
