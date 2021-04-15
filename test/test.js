const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })


  describe('Images', async () => {
    let result, imageCount;
    const hash = 'abc123';


    before(async () => {
      result = await decentragram.uploadImage(hash, 'Image description', {from:author});
      imageCount = await decentragram.imageCount()
    })

    it('Create Images', async () => {
      // SUCCESS
      assert.equal(imageCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'ID matches');
      assert.equal(event.hash, hash, 'Hash matches');
      assert.equal(event.description, 'Image description', 'Description matches');
      assert.equal(event.tipAmount, '0', 'Tip amount matches');
      assert.equal(event.author, author, 'Author matches');

      // FAIL
      await decentragram.uploadImage('', 'Image Description', {from:author}).should.be.rejected;
      await decentragram.uploadImage('Image hash', '', {from:author}).should.be.rejected;
     })

     it('Lists images', async () => {
      const image = await decentragram.images(imageCount);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'ID matches');
      assert.equal(image.hash, hash, 'Hash matches');
      assert.equal(image.description, 'Image description', 'Description matches');
      assert.equal(image.tipAmount, '0', 'Tip amount matches');
      assert.equal(image.author, author, 'Author matches');
     })

     it('Allow users to  tip the images', async () => {
        // Track the author balance before purchase
        let oldAuthorBalance
        oldAuthorBalance = await web3.eth.getBalance(author)
        oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

        result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

        // SUCCESS
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
        assert.equal(event.hash, hash, 'Hash is correct')
        assert.equal(event.description, 'Image description', 'description is correct')
        assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
        assert.equal(event.author, author, 'author is correct')

        // Check author received funds
        let newAuthorBalance;
        newAuthorBalance = await web3.eth.getBalance(author);
        newAuthorBalance = new web3.utils.BN(newAuthorBalance);

        let tipImageOwner;
        tipImageOwner = web3.utils.toWei('1', 'Ether');
        tipImageOwner = new web3.utils.BN(tipImageOwner);

        const expectedBalance = oldAuthorBalance.add(tipImageOwner);

        assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

        // FAIL
        await decentragram.tipImageOwner(99, {from:tipper, value:web3.utils.toWei('1', 'Ether')}).should.be.rejected;
     })
  })
})