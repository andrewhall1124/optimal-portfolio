import React from 'react';
import './login.css'

export function Login() {
  return (
    <main>
    <div className="about-container">
      <div className="about-text-container">
        <div className = "login-container">
          <div className="welcome-text">Welcome to <span className = "logo-color">Optimal-Portfolio</span></div>
          {/*Displayed when needing authentication*/}
          <div className="login-input-container" id="loginControls" >
            <div className="input-container">
              <input
                className="login-input"
                type="text"
                id="userName"
                placeholder="  your@email.com"
              />
            </div>
            <div className="input-container">
              <input
                className="login-input"
                type="password"
                id="userPassword"
                placeholder="  password"
              />
            </div>
            <div className="login-button-container">
              <button className= "login-button" type="button" onclick="loginUser()">
                Login
              </button>
              <button className = "login-button" type="button" onclick="createUser()">
                Create
              </button>
            </div>
          </div>
          {/* <!-- Displayed when ready to play --> */}
          <div className="play-controls-container" id="playControls" style={{display: "none"}}>
            <div id="playerName"></div>
            <div className="play-button-container">
                <button className ="play-button" type="button" onclick="play()">
                  Portfolios
                </button>
                <button className="play-button" type="button" onclick="logout()">
                  Logout
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* <!-- Error dialog --> */}
    <div id="msgModal" style={{display: "none"}}>
      <div className="modal-body">error message here</div>
        <div className = "login-button-container">
          <button
            type="button" onclick = "closeModal()" className="login-button"
          >
            Close
          </button>
        </div>
    </div>
  </main>
  );
}
