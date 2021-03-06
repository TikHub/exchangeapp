import React, { Component } from "react";
import logo from "./logo.svg";
import Header from "./components/Header";
import TabContainer from "./components/TabContainer/TabContainer";
import "./App.css";

export default class App extends Component {
  state = {
    marketURL: "https://exchange-test-app.herokuapp.com/market",
    currenciesURL: "https://exchange-test-app.herokuapp.com/currencies",
    favorites: [],
    marketData: [],
    dataIsReady: false,
    sorted: false
  };

  componentWillMount() {
    if (!JSON.parse(localStorage.getItem("favorites"))) {
      localStorage.setItem("favorites", "[]");
    }
  }
  componentDidMount() {
    this.getData();
    this.getInitalFavorites();
  }
  componentDidUpdate() {}

  getInitalFavorites = () => {
    let favorites = JSON.parse(localStorage.getItem("favorites"))
      ? JSON.parse(localStorage.getItem("favorites"))
      : [];
    this.setState({
      favorites
    });
  };

  getData = () => {
    const { marketURL, currenciesURL } = this.state;
    fetch(marketURL)
      .then(responce => {
        return responce.json();
      })
      .then(data => {
        this.setState({
          marketData: data.market,
          toCurrencyId: data.toCurrencyId
        });
        return fetch(currenciesURL);
      })
      .then(responce => {
        return responce.json();
      })
      .then(data => {
        const fullData = this.state.marketData.map(item => {
          item.currencyName = data.currencies.filter(curr => {
            return curr.currencyId === item.fromCurrencyId;
          })[0]["currencyName"];
          return item;
        });
        this.setState({
          dataIsReady: true,
          marketData: fullData
        });
      })
      .catch(error => {
        throw new Error(error);
      });
  };

  toggleFavorite = data => {
    let copiedFavorites = [...this.state.favorites];
    if (JSON.stringify(this.state.favorites).includes(JSON.stringify(data))) {
      copiedFavorites = copiedFavorites.filter(function(favorite) {
        return favorite.fromCurrencyId !== data.fromCurrencyId;
      });
    } else {
      copiedFavorites.push(data);
    }
    localStorage.setItem("favorites", JSON.stringify(copiedFavorites));
    this.setState({
      favorites: copiedFavorites
    });
  };
  removeFavorite = data => {
    let copiedFavorites = [...this.state.favorites];
    if (JSON.stringify(this.state.favorites).includes(JSON.stringify(data))) {
      copiedFavorites = copiedFavorites.filter(function(favorite) {
        return favorite.fromCurrencyId !== data.fromCurrencyId;
      });
    }
    localStorage.setItem("favorites", JSON.stringify(copiedFavorites));
    this.setState({
      favorites: copiedFavorites
    });
  };

  sortData = data => {
    if (!this.state.sorted) {
      this.setState({
        sorted: !this.state.sorted,
        marketData: data.sort((a, b) => b.price - a.price)
      });
    } else {
      this.setState({
        sorted: !this.state.sorted,
        marketData: data.sort((a, b) => a.price - b.price)
      });
    }
  };
  render() {
    const { favorites, marketData, sorted, dataIsReady } = this.state;
    return (
      <div className="App">
        <div className="container">
          <Header title="USD Exchange" logo={logo} />
          <TabContainer
            favorites={favorites}
            marketData={marketData}
            toggleFavorite={this.toggleFavorite}
            removeFavorite={this.removeFavorite}
            sortData={this.sortData}
            sorted={sorted}
            dataIsReady={dataIsReady}
          />
        </div>
      </div>
    );
  }
}
