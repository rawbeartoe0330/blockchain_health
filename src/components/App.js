import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Healthcare from '../abis/Healthcare.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Healthcare.networks[networkId]
    if(networkData) {
      const healthcare = new web3.eth.Contract(Healthcare.abi, networkData.address)
      this.setState({ healthcare })
      const patientCount = await healthcare.methods.patientCount().call()
      this.setState({ patientCount })
      for (var i = 1; i <= patientCount; i++) {
        const patient = await healthcare.methods.patients(i).call()
        this.setState({
          patients: [...this.state.patients, patient]
        })
      }
      this.setState({ loading: false })
    } else {
      window.alert('Healthcare contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      patientCount: 0,
      patients: [],
      loading: true
    }
    this.createPatient = this.createPatient.bind(this)
    this.transferPatient = this.transferPatient.bind(this)
  }

  createPatient(name, age, price) {
    this.setState({ loading: true })
    this.state.healthcare.methods.createPatient(name, age, price).send({ from: this.state.account })
    .once('receipt', (receipt)=> {
      this.setState({ loading: false })
    })
  }

  transferPatient(id, age, price) {
    this.setState({ loading: true })
    this.state.healthcare.methods.transferPatient(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt)=> {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
            { this.state.loading 
              ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
              : <Main 
                patients = {this.state.patients} 
                createPatient={this.createPatient} 
                transferPatient={this.transferPatient} /> 
            }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;