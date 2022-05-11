const express = require('express');
const multer = require('multer');

const productsRepo = require('../../repo/products');
const createProductTemplate = require('../../views/admin/products/new');
const productIndexTemplate = require('../../views/admin/products/index');
const productEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');
const { handleErrors, auth } = require('./middlewares');
const { route } = require('./auth');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.get('/', async (req, res) => {
  const products = await productsRepo.getAll();

  res.send(productIndexTemplate({ products }));
});

router.get('/new', (req, res) => {
  res.send(createProductTemplate({}));
});

router.post(
  '/new',
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(createProductTemplate),
  async (req, res) => {
    const { title, price } = req.body;
    try {
      const image = req.file.buffer.toString('base64');
      await productsRepo.create({ title, price, image });
    } catch {
      const image = 'image.jpg';
      await productsRepo.create({ title, price, image });
    }

    res.redirect('/admin/products');
  }
);

router.get('/:id/edit', async (req, res) => {
  const id = req.params.id;
  const product = await productsRepo.getOne(id);

  if (!product) {
    return res.send('Product not found');
  }

  res.send(productEditTemplate({ product }));
});

router.post(
  '/:id/edit',
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(productEditTemplate, async (req) => {
    const product = await productsRepo.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    const changes = req.body;

    if (req.file) {
      changes.image = req.file.buffer.toString('base64');
    }

    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);

router.post('/:id/delete', async (req, res) => {
  await productsRepo.deleteOne(req.params.id);

  res.redirect('/admin/products');
});

module.exports = router;
