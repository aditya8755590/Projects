import reactSvg from '../assets/react.svg'
export default function NavBar() {
  return (
    <nav className='nav-bar'>
      <img src={reactSvg} alt="React Logo" />
      <span>ReactFacts</span>
    </nav>
  )
}
