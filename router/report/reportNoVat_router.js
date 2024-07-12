const router = require("express").Router()
const ReportNoVat = require("../../controllers/report/reportNoVat_controller")

router.get("/quotation-novat/amount", ReportNoVat.quotationNoVatAmount)
router.get("/invoice-novat/amount", ReportNoVat.invoiceNoVatAmount)
router.get("/receipt-novat/amount", ReportNoVat.receiptNoVatAmount)

module.exports = router