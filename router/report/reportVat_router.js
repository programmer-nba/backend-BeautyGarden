const router = require("express").Router()
const ReportVat = require("../../controllers/report/reportVat_controller")

router.get("/quotation-vat/amount", ReportVat.quotationVatAmount)
router.get("/invoice-vat/amount", ReportVat.invoiceVatAmount)
router.get("/receipt-vat/amount", ReportVat.receiptVatAmount)

module.exports = router