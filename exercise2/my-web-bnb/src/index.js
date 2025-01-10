import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import { Contract, ethers } from "ethers";
import myContractManifest from "./contracts/MyContract.json";
import { useState, useEffect, useRef } from 'react';

function App(){
  const myContract = useRef(null);
  const [tickets, setTickets] = useState([]);
  const [contractBalance, setContractBalance] = useState(0);
  const [ticketsBalance, setTicketsBalance] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect( () => {
    initContracts();
  }, [tickets] )

  let initContracts = async () => {
    await configureBlockchain();
    let ticketsFromBlockchain  = await myContract.current?.getTickets();
    if (ticketsFromBlockchain != null)
      setTickets(ticketsFromBlockchain)

    let contractBalanceFromBlockchain  = await myContract.current?.getContractBalance();
    if (contractBalanceFromBlockchain != null)
      setContractBalance(parseFloat(contractBalanceFromBlockchain))

    let ticketsBalanceFromBlockchain  = await myContract.current?.getBalanceWei();
    if (ticketsBalanceFromBlockchain != null)
      setTicketsBalance(parseFloat(ticketsBalanceFromBlockchain))
  }

  let configureBlockchain = async () => {
    try {
      let provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const networkId = await provider.request({ method: 'net_version' })

        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();

        myContract.current = new Contract(
          '0x39385E97Cd488Fe8952BE76F18087F071e62A319',
          myContractManifest.abi,
          signer
        );

        setBalance(parseFloat(await provider.getBalance(await signer.getAddress())));
        
      }
    } catch (error) {
      console.log(error);
    }
  }

  let clickBuyTicket = async (i) => {
    const tx = await myContract.current.buyTicket(i,{
      value: ethers.utils.parseEther("0.02"),
      gasLimit: 6721975,
      gasPrice: 20000000000,

    });
    await tx.wait();

    const ticketsUpdated = await myContract.current.getTickets();
    setTickets(ticketsUpdated);

    const contractBalanceUpdated = await myContract.current.getContractBalance();
    setContractBalance(parseFloat(contractBalanceUpdated));

    const ticketsBalanceUpdated = await myContract.current.getBalanceWei();
    setTicketsBalance(parseFloat(ticketsBalanceUpdated));
  }

  let withdrawBalance = async () => {
    const tx = await myContract.current.transferBalanceToAdmin();
  }

  let changeAdmin = async (e) => {
    e.preventDefault();
    let newAdmin = e.target.elements.newadmin.value;
    const tx = await myContract.current.changeAdmin(newAdmin);
  }

  return (
    <div>
      <h1>Tickets store</h1>
      <p>Contract Balance: {contractBalance}</p>
      <p>Tickets Balance: {ticketsBalance}</p>
      <p>Balance: {balance} </p>
      <button onClick={() => withdrawBalance()}>Withdraw Balance</button>
      <form className="form-inline" onSubmit={ (e) => changeAdmin(e)}>
        <input type="text" name="newadmin" placeholder='New Admin Address'/>
        <button type="submit" > Change Admin </button>
      </form>
      <ul>
        {tickets.map((address, i) =>
          <li>Ticket {i} comprado por {address}
          { address == ethers.constants.AddressZero && 
                <a href="#" onClick={()=>clickBuyTicket(i)}> buy</a> }
          </li>
        )}
      </ul>
    </div>
  )

}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
