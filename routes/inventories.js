var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// GET all inventories (join với product)
router.get('/', async function (req, res) {
    try {
        let data = await inventoryModel.find().populate({
            path: 'product',
            select: 'title slug price description category images'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by ID (join với product)
router.get('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title slug price description category images'
        });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: 'Inventory not found' });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// POST add_stock - tăng stock
router.post('/add_stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Không tìm thấy inventory cho product này' });
        }
        inventory.stock += quantity;
        await inventory.save();
        res.send({ message: 'Thêm stock thành công', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST remove_stock - giảm stock
router.post('/remove_stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Không tìm thấy inventory cho product này' });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: `Không đủ stock. Hiện tại: ${inventory.stock}` });
        }
        inventory.stock -= quantity;
        await inventory.save();
        res.send({ message: 'Giảm stock thành công', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST reservation - giảm stock, tăng reserved
router.post('/reservation', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Không tìm thấy inventory cho product này' });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: `Không đủ stock để đặt hàng. Hiện tại: ${inventory.stock}` });
        }
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.send({ message: 'Đặt hàng (reservation) thành công', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST sold - giảm reserved, tăng soldCount
router.post('/sold', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: 'product và quantity (> 0) là bắt buộc' });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: 'Không tìm thấy inventory cho product này' });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: `Không đủ reserved để xác nhận bán. Hiện tại: ${inventory.reserved}` });
        }
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.send({ message: 'Xác nhận bán (sold) thành công', inventory });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
