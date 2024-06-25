const router = require("express").Router()
const Product = require("../../controllers/order/product_controller.js")

router.post("/product", Product.createProduct)
router.put("/product/:id", Product.updateProduct)
router.get("/products", Product.getProducts)
router.get("/product/:id", Product.getProduct)
router.delete("/product/:id", Product.deleteProduct)

module.exports = router