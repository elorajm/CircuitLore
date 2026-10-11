import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar.jsx'
import Footer from '../components/Footer.jsx'
import './MainLayout.css'

function MainLayout() {
  return (
    <div className="site">
      <header className="site-header">
        <NavBar />
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
