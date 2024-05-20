const Picture64 = require("../../controllers/admin/picture64.controller")
const route = require("express").Router()

route.post("/uploads", Picture64.uploadPictures)
route.post("/upload", Picture64.uploadPicture)
route.put("/:id/upload", Picture64.updatePicture)
route.get("/:refId", Picture64.getPictureByRefs)

module.exports = route