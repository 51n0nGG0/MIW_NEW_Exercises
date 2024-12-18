import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import {Contract, ethers} from "ethers";
import { useState, useEffect, useRef } from 'react';
import bankManifest from "./contracts/Bank.json";

function App(){
    const bank = useRef(null);
    const [balance, setBalance] = useState(0);
    const [interest, setInterest] = useState(0);

    useEffect( () => {
        initContracts();
    }, [])

    let initContracts = async () => {
        await getBlockchain();
        let balanceFromBlockChain  = await bank.current?.getBalance();
        if (balanceFromBlockChain != null) {
            setBalance(parseFloat(balanceFromBlockChain))
        }

        let interestFromBlockChain  = await bank.current?.getInterest();
        if (interestFromBlockChain != null) {
            setInterest(parseFloat(interestFromBlockChain))
        }
    }

    let getBlockchain = async () => {
        let provider = await detectEthereumProvider();
        if(provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            const networkId = await provider.request({ method: 'net_version' })

            provider = new ethers.providers.Web3Provider(provider);
            const signer = provider.getSigner();

            bank.current = new Contract(
              "0xAbd32D65FBb8B89C4D16D8C1989286437A29fF2D",
              bankManifest.abi,
              signer
           );
        }
        return null;
    }

    let onSubmitDeposit = async (e) => {
      e.preventDefault();
  
      const BNBamount = parseFloat(e.target.elements[0].value);
  
      // Wei to BNB se pasa con ethers.utils recibe un String!!!
      const tx = await bank.current.deposit({
          value: ethers.utils.parseEther(String(BNBamount)),
          gasLimit: 6721975,
          gasPrice: 20000000000,
      });
  
      await tx.wait();
    }

    let clickWithdraw = async (e) => {
      await await bank.current.withdraw();
    }

    return (
        <div>
            <h1>Bank</h1>
            <p>Balance: {balance/1e18} BNB</p>
            <p>Interest: {interest/1e18} BMIW</p>
            <form onSubmit= { (e) => onSubmitDeposit(e) } >
                <input type="number" step="0.01" />
                <button type="submit">Deposit</button>
            </form>
            <button onClick= { () => clickWithdraw() } > Withdraw </button>
        </div>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
