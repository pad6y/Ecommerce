// const fs = require('fs');
const crypto = require('crypto');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attrs) {
    const records = await this.getAll();

    if (!attrs.id) {
      attrs.id = this.randomId();
    }
    const salt = crypto.randomBytes(8).toString('hex');
    const hashed = await scrypt(attrs.password, salt, 64);

    const record = {
      ...attrs,
      password: `${hashed.toString('hex')}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }

  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split('.');
    const enteredHash = await scrypt(supplied, salt, 64);

    return hashed === enteredHash.toString('hex');
  }
}

module.exports = new UsersRepository('users.json');
// await repo.create({ email: 'frankel@abc.com', password: '123456' });

// const user = await repo.getOne('303bc367');
// console.log(user);

// repo.deleteOne('303bc367');

// repo.update('5bba3572ju', { email: 'Enzo@CrazyDog.com' });

// const users = await repo.getAll();
// console.log(users);

// const found = await repo.getOneBy({ email: 'abc@abc.com', id: 'a1323ad2' });
// console.log(found);
