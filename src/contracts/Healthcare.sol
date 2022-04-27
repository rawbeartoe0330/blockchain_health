pragma solidity ^0.5.0;

contract Healthcare {
	string public name;
	uint public patientCount = 0;

	mapping(uint => Patient) public patients;

	struct Patient {
		uint id;
		string name;
		uint age;
		uint price;
		address payable owner;
		bool transfered;
	}

	event PatientCreated(
		uint id,
		string name,
		uint age,
		uint price,
		address payable owner,
		bool transfered
	);

	event PatientTransfered(
		uint id,
		string name,
		uint age,
		uint price,
		address payable owner,
		bool transfered
	);


	constructor() public {
		name = "Healthcare Application";
	}

	function createPatient(string memory _name, uint _age, uint _price) public {
		//Require a valid name
		require(bytes(_name).length > 0, "The patient's name must be valid");

		//Require a valid price
		require(_price > 0, "The price must be greater than zero");

		//Require a valid age
		require(_age > 0, "The age must be greater than zero");

		//Make sure parameters are correct
		//Increment Patient Count
		patientCount ++;

		//Create the patient
		patients[patientCount] = Patient(patientCount, _name, _age, _price, msg.sender, false);
		//Trigger an event
		emit PatientCreated(patientCount, _name, _age, _price, msg.sender, false);
	}

	function transferPatient(uint _id) public payable {
		// Fetch the patient
		Patient memory _patient = patients[_id];
		
		// Find the owner
		address payable _provider = _patient.owner;

		// Make sure patient has valid id
		require(_patient.id > 0 && _patient.id <= patientCount, "The patient must have a valid id");

		// Require there is enough Ether in the transaction
		require(msg.value >= _patient.price, "There should be enough ether for the transaction");

		// Required that the patient not be transfered already
		require(!_patient.transfered, "The patient must have not been transfered before");

		// Require the receiver is not the provider
		require(_provider != msg.sender, "The sender and the provider must be two different accounts");

		// Transfer ownership
		_patient.owner = msg.sender;

		// Mark as transfered
		_patient.transfered = true;

		// Update the patient
		patients[_id] = _patient;

		// Pay the money to the sender
		address(_provider).transfer(msg.value);

		// Trigger an event
		emit PatientTransfered(patientCount, _patient.name, _patient.age, _patient.price, msg.sender, true);
	}
}