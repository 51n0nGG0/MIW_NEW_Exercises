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

    const [doubleBalance, setDoubleBalance] = useState(0);
    const [doubleInterest, setDoubleInterest] = useState(0);

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

        let doubleBalanceFromBlockChain  = await bank.current?.getDoubleBalance();
        if (doubleBalanceFromBlockChain != null) {
            setDoubleBalance(parseFloat(doubleBalanceFromBlockChain))
        }

        let doubleInterestFromBlockChain  = await bank.current?.getDoubleInterest();
        if (doubleInterestFromBlockChain != null) {
            setDoubleInterest(parseFloat(doubleInterestFromBlockChain))
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
                "0xbFb6AB5607fF307687911f8C2BaBd57916c68535",
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

        const tx = await bank.current.withdraw({
            value: ethers.utils.parseEther("0.05"),
            gasLimit: 6721975,
            gasPrice: 20000000000,
        });

        await tx.wait();

    }

    let onSubmitDepositDouble = async (e) => {
        e.preventDefault();
    
        const BNBamount = parseFloat(e.target.elements[0].value);
    
        // Wei to BNB se pasa con ethers.utils recibe un String!!!
        const tx = await bank.current.depositDouble({
                value: ethers.utils.parseEther(String(BNBamount)),
                gasLimit: 6721975,
                gasPrice: 20000000000,
        });

        await tx.wait();
    }

    let clickWithdrawDouble = async (e) => {
        await bank.current.withdrawDouble();
    }

    let onSubmitBuyBMIW = async (e) => {

        const BMIWamount = parseFloat(e.target.elements[0].value);

        await bank.current.buyBMIW(BMIWamount,{
            value: ethers.utils.parseEther(String(BMIWamount*0.001)),
                gasLimit: 6721975,
                gasPrice: 20000000000,
        });
    }
    
    return (
        <div>
            <h1>Bank</h1>
            <h2>Normal Interest</h2>
            <p>Balance: {balance/1e18} BNB</p>
            <p>Interest: {interest/1e18} BMIW</p>
            <form onSubmit= { (e) => onSubmitDeposit(e) } >
                <input type="number" step="0.01" />
                <button type="submit">Deposit</button>
            </form>
            <button onClick= { () => clickWithdraw() } > Withdraw </button>

            <h2>Double Interest</h2>
            <p>Balance: {doubleBalance/1e18} BNB</p>
            <p>Interest: {doubleInterest/1e18} BMIW</p>
            <form onSubmit= { (e) => onSubmitDepositDouble(e) } >
                <input type="number" step="0.01" />
                <button type="submit">Deposit</button>
            </form>
            <button onClick= { () => clickWithdrawDouble() } > Withdraw </button>
            <h2>Buy BMIW</h2>
            <form onSubmit={(e) => onSubmitBuyBMIW(e)}>
                <input type="number" step="1" placeholder='Quantity of BMIW'/>
                <button type="submit">Buy</button>
            </form>
        </div>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
