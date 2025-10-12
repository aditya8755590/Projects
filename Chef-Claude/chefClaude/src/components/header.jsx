import icon from '../assets/chef-logo.png';
export default function Header() {
  return (
    <header>
        <div className="header-content">
            <img src={icon} alt="Chef Claude" />
            <span>Chef Claude</span>
        </div>
    </header>
  )
}
