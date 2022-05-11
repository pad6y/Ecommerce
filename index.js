const express = require('express');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const adminProductRouter = require('./routes/admin/products');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/carts');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    keys: ['cookie-secret-word-string'],
  })
);

app.use(authRouter);
app.use('/admin/products', adminProductRouter);
app.use(productRouter);
app.use(cartRouter);

app.listen(3000, () => {
  console.log('listening on port 3000');
});
