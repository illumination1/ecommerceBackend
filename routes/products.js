const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }

        const productList = await Product.find(filter).populate('category');

        if (!productList) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve products' });
        }
        res.send(productList);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.send(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post(`/`, async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        });

        product = await product.save();

        if (!product) return res.status(500).send('The product cannot be created');

        res.send(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(400).send('Invalid Category');

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                richDescription: req.body.richDescription,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category,
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            },
            { new: true }
        );

        if (!product) return res.status(500).send('The product cannot be updated!');

        res.send(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndRemove(req.params.id);

        if (product) {
            res.status(200).json({ success: true, message: 'The product is deleted!' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found!' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const productCount = await Product.countDocuments();

        res.send({
            productCount: productCount
        });
    } catch (error) {
        console.error('Error counting products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/get/featured/:count`, async (req, res) => {
    try {
        const count = req.params.count ? parseInt(req.params.count) : 0;
        const products = await Product.find({ isFeatured: true }).limit(count);

        res.send(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
