const express=require('express');
const Product=require('../models/products.model')
const router=express.Router();
const {getProducts,addProduct,getProductById,updateProduct,deleteProduct}=require('../controllers/product.controller');

router.get('/',getProducts);
router.post('/',addProduct);
router.get('/:id',getProductById);
router.put('/:id',updateProduct);
router.delete('/:id',deleteProduct);

module.exports=router;
