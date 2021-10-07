const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const { STRING, TEXT } = Sequelize;
const config = {
  logging: false
};

if(process.env.LOGGING){
  delete config.logging;
}
console.log(process.env.DATABASE_URL);
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const Note = conn.define('note', {
    txt: TEXT
});
const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.prototype.getNotes = function(){
  return Note.findAll({
    where: { userId: this.id }
  })
}

Note.belongsTo(User);

User.byToken = async(token)=> {
  try {
    const user = await User.findByPk(jwt.verify(token, process.env.JWT).id);
    if(user){
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username,
      password
    }
  });
  if(user){
    return jwt.sign({ id: user.id }, process.env.JWT); 
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  const notes = await Promise.all([
    Note.create({ txt: 'larrys note', userId: larry.id}), 
    Note.create({ txt: 'larrys note 2', userId: larry.id}), 
    Note.create({ txt: 'moes note', userId: moe.id}) 
  ]);
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note
  }
};