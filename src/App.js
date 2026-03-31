import logo from './logo.svg';
// import "./Styles/font.css"
import './App.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './Pages/Home/Home';
import { Navbar } from './Component/Common/Navbar';
import { Mint } from './Pages/Mint/Mint';
import { Redeem } from './Pages/Redeem/Redeem';
import { Tool } from './Pages/Tools/Tool';
import { Stake } from './Pages/Stake/Stake';
import { Stake_withdraw } from './Pages/Stake-Withdraw/Stake_withdraw';
import { Lock } from './Pages/Lock/Lock';
import { Lock_withdraw } from './Pages/Lock-Withdraw/Lock_withdraw';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { Animate } from './Component/Common/Animate';
import { useCallback } from 'react';

function App() {


  const ele = useCallback(node => {
    if (!node) return;

    console.log("loaded")

    //console.log(myTitle);
    //console.log(mySubtitle);
    //console.log(myParagraph);

    ;
  }, []);
  return (
    <div className="App" ref={ele}>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path="/mint" element={<Mint/>}/>
          <Route path="/redeem" element={<Redeem/>}/>
          <Route path="/farm" element={<Tool/>}/>
          <Route path="/stake" element={<Stake/>}/>
          <Route path="/stake-withdraw" element={<Stake_withdraw/>}/>
          <Route path="/lock" element={<Lock/>}/>
          <Route path="/lock-withdraw" element={<Lock_withdraw/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
        {/* <Animate/> */}
      </BrowserRouter>
    </div>
  );
}

export default App;
