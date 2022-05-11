const fs = require('fs');
const crypto = require('crypto');

module.exports = class Repository {
  constructor(filename) {
    if (!filename) throw new Error('Creating a repository requires a filename');

    this.filename = filename;

    try {
      fs.accessSync(this.filename);
    } catch (e) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async create(attrs) {
    attrs.id = this.randomId();

    const records = await this.getAll();
    records.push(attrs);

    await this.writeAll(records);

    return attrs;
  }

  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: 'utf8',
      })
    );
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async deleteOne(id) {
    const records = await this.getAll();
    const deleted = records.filter((record) => record.id !== id);
    await this.writeAll(deleted);
  }

  // async update(id, updateData) {
  //   let record = await this.getOne(id);
  //   if (!record) throw new Error('No records found for update');

  //   record = { ...record, ...updateData };
  //   await this.delete(id);
  //   await this.create(record);
  // }

  // Course Version of Update
  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`No records with ${id} found for update`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) found = false;
      }

      if (found) return record;
    }
  }
};
