const router = require("express").Router()
const Order = require("../../controllers/order/order_controller.js")

router.post("/order", Order.createOrder)
router.put("/order/:id", Order.updateOrder)
router.put("/order-status/:id", Order.updateOrderStatus)
router.get("/order/:id", Order.getOrder)
router.get("/orders", Order.getOrders)
router.delete("/order/:id", Order.deleteOrder)

module.exports = router