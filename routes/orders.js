const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

        res.send(orderList);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/:id`, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems', populate: {
                    path: 'product', populate: 'category'
                }
            });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.send(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        }));

        const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        }));

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        order = await order.save();

        res.send(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.send(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndRemove(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        await Promise.all(order.orderItems.map(async (orderItem) => {
            await OrderItem.findByIdAndRemove(orderItem);
        }));

        res.status(200).json({ success: true, message: 'The order is deleted!' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
        ]);

        if (!totalSales.length) {
            return res.status(404).json({ success: false, message: 'No sales found' });
        }

        res.send({ totalsales: totalSales.pop().totalsales });
    } catch (error) {
        console.error('Error fetching total sales:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/get/count`, async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();

        res.send({
            orderCount: orderCount
        });
    } catch (error) {
        console.error('Error counting orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
    try {
        const userOrderList = await Order.find({ user: req.params.userid }).populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 });

        if (!userOrderList) {
            return res.status(404).json({ success: false, message: 'User orders not found' });
        }

        res.send(userOrderList);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
