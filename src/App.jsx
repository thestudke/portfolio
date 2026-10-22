import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Strengths from './components/Strengths'
import Contact from './components/Contact'

export default function App() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Strengths />
      </main>
      <Contact />
    </>
  )
}
