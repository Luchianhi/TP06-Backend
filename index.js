require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

const errorHandler = require('./src/middlewares/errorHandler');
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
