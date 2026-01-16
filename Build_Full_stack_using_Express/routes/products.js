import express from 'express'
import {getGenres} from '../controllers/productControllers.js'
import {getProducts} from '../controllers/productControllers.js'



const productsRouter=express.Router()
productsRouter.get('/',getProducts)
productsRouter.get('/genres',getGenres)

export default productsRouter
