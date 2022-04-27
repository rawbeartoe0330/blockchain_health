const Healthcare = artifacts.require('./Healthcare.sol')

require('chai')
.use(require('chai-as-promised'))
.should()

contract('Healthcare', ([deployer, provider, receiver]) => {
	let healthcare

	before(async () => {
		healthcare = await Healthcare.deployed()
	})

	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await healthcare.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
      		assert.notEqual(address, null)
      		assert.notEqual(address, undefined)
		})

		it('has a name', async () => {
			const name = await healthcare.name()
			assert.equal(name, 'Healthcare Application')
		})
	})



	describe('products', async () => {
		let result, patientCount

		before(async () => {
			result = await healthcare.createPatient('Jay Zhou', 10, web3.utils.toWei('1', 'Ether'), { from: provider })
			patientCount = await healthcare.patientCount()
		})

		it('creates patients', async () => {
			// success
			assert.equal(patientCount, 1)
			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), patientCount.toNumber(), 'id is correct')
      		assert.equal(event.name, 'Jay Zhou', 'name is correct')
      		assert.equal(event.age, '10', 'age is correct')
      		assert.equal(event.price, '1000000000000000000', 'price is correct')
      		assert.equal(event.owner, provider, 'owner is correct')
      		assert.equal(event.transfered, false, 'transfered is correct')

      		//failure: patient must have a name
      		await await healthcare.createPatient('', 10, web3.utils.toWei('1', 'Ether'), { from: provider }).should.be.rejected;

      		//failure: patient must have a price
      		await await healthcare.createPatient('Jay Zhou', 10, { from: provider }).should.be.rejected;
		})

		it('lists patients', async () => {
			const patient = await healthcare.patients(patientCount)
			assert.equal(patient.id.toNumber(), patientCount.toNumber(), 'id is correct')
      		assert.equal(patient.name, 'Jay Zhou', 'name is correct')
      		assert.equal(patient.age, '10', 'age is correct')
      		assert.equal(patient.price, '1000000000000000000', 'price is correct')
      		assert.equal(patient.owner, provider, 'owner is correct')
      		assert.equal(patient.transfered, false, 'transfered is correct')
		})

		it('transfers patients', async () => {
			// Track the provider balance before transfer
			let oldProviderBalance
			oldProviderBalance = await web3.eth.getBalance(provider)
			oldProviderBalance = new web3.utils.BN(oldProviderBalance)

			// success: receiver get transfered
			result = await healthcare.transferPatient(patientCount, { from: receiver, value: web3.utils.toWei('1', 'Ether')})

			// check logs
			const event = result.logs[0].args
			assert.equal(event.id.toNumber(), patientCount.toNumber(), 'id is correct')
      		assert.equal(event.name, 'Jay Zhou', 'name is correct')
      		assert.equal(event.age, '10', 'age is correct')
      		assert.equal(event.price, '1000000000000000000', 'price is correct')
      		assert.equal(event.owner, receiver, 'owner is correct')
      		assert.equal(event.transfered, true, 'transfered is correct')

      		// check provider got the fund
      		let newProviderBalance
      		newProviderBalance = await web3.eth.getBalance(provider)
      		newProviderBalance = new web3.utils.BN(newProviderBalance)

      		let price
      		price = web3.utils.toWei('1', 'Ether')
      		price = new web3.utils.BN(price)

      		const expectedBalance = oldProviderBalance.add(price)
      		assert.equal(newProviderBalance.toString(), expectedBalance.toString())

      		// failure: try to transfer a patient that not exist, patient must have valid id
      		await healthcare.transferPatient(99, { from: receiver, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

      		// failure: receiver tries to get the record without enough ether
      		await healthcare.transferPatient(patientCount, { from: receiver, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

      		// failure: Deployer tries to transfer the patient,  patient cannot be transfered twice
      		await healthcare.transferPatient(patientCount, { from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

      		// failure: Receiver tries to get record again,   receiver cannot be provider
      		await healthcare.transferPatient(patientCount, { from: receiver, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
		})
	})







})