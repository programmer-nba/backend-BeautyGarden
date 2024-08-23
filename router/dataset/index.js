const router = require("express").Router()
const PaymentTerm = require("../../controllers/dataset/paymentTerm_controller.js")
const Remark = require("../../controllers/dataset/remark_controller.js")

// paymentTerm
router.post("/dataset/payment_terms", PaymentTerm.createPaymentTerm)
router.put("/dataset/payment_terms/:id", PaymentTerm.updatePaymentTerm)
router.get("/dataset/payment_terms", PaymentTerm.getPaymentTerms)
router.get("/dataset/payment_terms/:id", PaymentTerm.getPaymentTerm)
router.delete("/dataset/payment_terms/:id", PaymentTerm.deletePaymentTerm)

// remark
router.post("/dataset/remarks", Remark.createRemark)
router.put("/dataset/remarks/:id", Remark.updateRemark)
router.get("/dataset/remarks", Remark.getRemarks)
router.get("/dataset/remarks/:id", Remark.getRemark)
router.delete("/dataset/remarks/:id", Remark.deleteRemark)

module.exports = router