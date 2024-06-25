const router = require("express").Router()
const QuotationVat = require("../../controllers/order/quotationVat_controller.js")
const QuotationNoVat = require("../../controllers/order/quotationNoVat_controller.js")

router.post("/quotation-vat", QuotationVat.createQuotationVat)
router.put("/quotation-vat", QuotationVat.updateQuotationVat)
router.get("/quotation-vat", QuotationVat.getQuotationVat)
router.get("/quotations-vat", QuotationVat.getQuotationsVat)
router.delete("/quotation-vat", QuotationVat.deleteQuotationVat)

router.post("/quotation-novat", QuotationNoVat.createQuotationNoVat)
router.put("/quotation-novat/:id", QuotationNoVat.updateQuotationNoVat)
router.get("/quotation-novat/:id", QuotationNoVat.getQuotationNoVat)
router.get("/quotations-novat", QuotationNoVat.getQuotationsNoVat)
router.delete("/quotation-novat/:id", QuotationNoVat.deleteQuotationNoVat)

module.exports = router