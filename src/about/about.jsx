import React from 'react';
import './about.css'

export function About() {

  return (
      <main>
        <div className="about-container">
          <div className="about-text-container">
            <div className="about-text">
            Welcome to Optimal-Portfolio, your one-stop-shop for creating an optimized investment portfolio. Our web app allows investors to input three stock tickers and fetch the average monthly return and standard deviation of each stock. With this information, investors can calculate the portfolio return, standard deviation, and Sharpe ratio based on the weights they input. Optimal-Portfolio takes things to the next level by utilizing the efficient frontier to help investors optimize their portfolio. The efficient frontier is a graphical representation of the possible portfolios that provide the highest expected return for a given level of risk. By optimizing the portfolio using the efficient frontier, investors can find the best possible combination of assets that will give them the highest return for a given level of risk. With Optimal-Portfolio, you can create a portfolio that fits your investment goals and risk tolerance, and maximize your returns.
            </div>
          </div>
        </div>
      </main>
  );
}