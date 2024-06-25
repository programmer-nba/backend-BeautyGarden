const router = require("express").Router()
const Client = require("../../controllers/client/client_controller.js")

router.post("/client", Client.createClient)
router.put("/client/:id", Client.updateClient)
router.get("/client/:id", Client.getClient)
router.get("/clients", Client.getClients)
router.delete("/client/:id", Client.deleteClient)

module.exports = router