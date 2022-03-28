import React from 'react';
import './App.css';
import { Header } from './components/Header';
import {Workplace, Workplaces} from "./components/Workplace";

let workplaces: Workplace[] = []

function App() {
  return (
    <div className="App">
      <Header />
      <Workplaces/>
    </div>
  );
}

export default App;
