import logo from './logo.svg';
import './App.css';

function App() {

const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');

// Asynchronously determine if the user is authenticated by calling the service
const [authState, setAuthState] = React.useState(AuthState.Unknown);
React.useEffect(() => {
  if (userName) {
    fetch(`/api/user/${userName}`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((user) => {
        const state = user?.authenticated ? AuthState.Authenticated : AuthState.Unauthenticated;
        setAuthState(state);
      });
  } else {
    setAuthState(AuthState.Unauthenticated);
  }
}, [userName]);


  return (
    <div>
      <header>
        <div className="nav-bar">
          <div className="logo-container">
            <div className="logo">
              <NavLink to='index.html'>Optimal-Portfolio</NavLink>
            </div>
          </div>
          {authState === AuthState.Authenticated && (
          <div className="nav-item">
            <NavLink to='portfolio.html'>Portfolios</NavLink>
          </div>)}
          <div className="nav-item">
            <NavLink to='about.html'>About</NavLink>
          </div>
        </div>
      </header>

      <Routes>
        <Route path='/' element={<Login />} exact />
        <Route path='/portfolio' element={<Portfolios />} />
        <Route path='/about' element={<About />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      
      <footer>
      <div className="footer-container">
        <div className="footer-element"><a href="https://www.linkedin.com/in/andrewhall1124/" target="_blank">Andrew Hall</a></div>
        <div className="footer-element"><a href="https://github.com/andrewhall1124/optimal-portfolio" target="_blank">Github</a></div>
      </div>
    </footer>
    </div>
  );
}

export default App;
