const { expect } = require('chai');
const { syncAndSeed } = require('../db');
describe('Models', ()=> {
  let seed;
  beforeEach(async()=> seed = await syncAndSeed());
  describe('User', ()=> {
    describe('user.getNotes', ()=> {
      console.log('foo');
      it('returns notes', async()=> {
        const user = seed.users.larry;
        const notes = await user.getNotes();
        expect(notes.length).to.equal(2);
      });
    });
  });
});