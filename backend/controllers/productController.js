import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc Fetch all products
// @route GET / api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 8;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i'}} : {};
    const count = await Product.countDocuments({...keyword});

    const products = await Product.find({...keyword}).limit(pageSize).skip(pageSize * (page - 1));
    res.json({products, page, pages: Math.ceil(count / pageSize)});
});

// @desc Fetch a products
// @route GET / api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    
    if(product){
        return res.json(product);
    } else{
        res.status(404);
        throw new Error('Resource Not Found');
    }
   
});

// @desc Create a products
// @route POST / api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const product = new Product({
        name : 'Sample name',
        price: 0,
        user: req.user._id,
        image: '/images/sample.jpg',
        brand: 'Sample Brand',
        category: 'Sample category',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample Desciption'
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc Update a products
// @route PUT / api/products
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {name, price, category, description, image, brand, countInStock} = req.body;

    const product = await Product.findById(req.params.id);

    if(product){
        product.name = name;
        product.categor = category;
        product.price = price;
        product.brand = brand;
        product.description = description;
        product.image = image;
        product.countInStock = countInStock;

        const updatedProduct = await product.save();
        res.json(updateProduct); 
    }else{
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc Delete a product
// @route DELETE / api/products
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if(product){
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product Deleted'});
    }else{
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc Create a product review
// @route DELETE / api/products/;id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
    const {rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if(product){
        const alreadyReviewed = product.review.find((review) => review.user.toString() === req.user._id.toString());

        if(alreadyReviewed){
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        }

        product.review.push(review);
        product.numReviews = product.review.length;

        product.rating = product.review.reduce((acc, review) => acc + review.rating, 0) / product.review.length;

        await product.save();
        res.status(201).json({ message: 'Review Added'});
}else{
        res.status(404);
        throw new Error('Resource not found');
    }
});

// @desc Get top rated products
// @route GET / api/products/top
// @access Public
const getTopProducts = asyncHandler(async (req, res) => {
    const product = await Product.find({}).sort({rating : -1}).limit(3);
    res.status(200).json(product);
});

export {getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, getTopProducts}