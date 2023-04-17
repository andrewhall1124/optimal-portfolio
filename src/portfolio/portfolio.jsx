import React from 'react';
import './portfolio.css'

export function Portfolio() {

  return (
    <main>
      <div className="stats-container">
        <div className="inner-stats-container">
          <div className="stocks-container">
            <table id="stocks-table">
              <tr>
                <th colSpan='3'>Stocks</th>
              </tr>
              <tr>
                <th>Ticker</th>
                <th>Er</th>
                <th>SD</th>
              </tr>
              <tr>
                <td><input class="width" type="text" id="ticker-1"/></td>
                <td id="return-1"></td>
                <td id="risk-1"></td>
              </tr>
              <tr>
                <td id="button-row" >
                  <input type="submit" class="add-row-button" value="+" onclick="addNewRow()"/>
                  <input type="submit" class="minus-row-button" value="-" onclick="deleteLastRow()"/>
                </td>
              </tr>
            </table>
          </div>
          <div className="button-container-1">
            <input class='submit-button' type = "Submit" value="Fetch" onclick="fetchData()"/>
          </div>
        </div>
        <div className="inner-stats-container">
          <div className ='weights-container'>
            <table id="weights-table">
              <tr>
                <th colSpan='2'>Weights</th>
              </tr>
              <tr>
                <th>Ticker</th>
                <th>Weight</th>
              </tr>
              <tr>
                <td id = "weight-name-1"></td>
                <td><input class="width" type="text" id="weight-1" value=".3333"/></td>
              </tr> 
            </table>
          </div>
          <div className="portfolio-container">
            <table>
              <tr>
                <th colSpan='2'>Portfolio</th>
              </tr>
              <tr>
                <td>Er</td>
                <td id="portfolio-return"></td>
              </tr>
              <tr>
                <td>SD</td>
                <td id="portfolio-risk"></td>
              </tr>
              <tr>
                <td>Sharpe</td>
                <td id="portfolio-sharpe"></td>
              </tr>
            </table>
          </div>
          <div className="button-container-1">
            <input class='submit-button' type = "Submit" value="Calculate" onclick="calculateData()"/>
          </div>
          <div className="messages-container">
            <div className="message-header">Messages</div>
              <span className="user-name"></span>
              <div id="messages"></div>
            </div>
          </div>
        </div>
      <div className="graph-container">
        <div className="graph">
        </div>
      </div>
    </main>
  );
}