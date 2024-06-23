const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (!categoryList) {
            return res.status(500).json({ success: false });
        }
        res.status(200).send(categoryList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'The category with the given ID was not found.' });
        }
        res.status(200).send(category);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        });
        category = await category.save();
        res.status(201).send(category);
    } catch (err) {
        res.status(400).send('The category could not be created!');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                icon: req.body.icon || category.icon,
                color: req.body.color
            },
            { new: true }
        );
        if (!category) {
            return res.status(404).send('The category with the given ID was not found.');
        }
        res.send(category);
    } catch (err) {
        res.status(400).send('The category could not be updated!');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found!" });
        }
        res.status(200).json({ success: true, message: 'The category is deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
