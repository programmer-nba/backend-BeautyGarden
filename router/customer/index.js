const router = require("express").Router();
const customer = require("../../controllers/customer/customer.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/create", authAdmin, customer.create);
router.put("/EditCustomer/:id", authAdmin, customer.EditCustomer);
router.delete("/deleteCustomer/:id", authAdmin, customer.deleteCustomer);
router.get("/getCustomerAll", authAdmin, customer.getCustomerAll);
router.get("/getCustomerBy/:id", authAdmin, customer.getCustomerById);
module.exports = router;
