const router = require("express").Router();
const Project = require("../../controllers/admin/project.controllers");
const authAdmin = require("../../lib/auth.admin");

router.post("/create", authAdmin, Project.createProject)
router.put("/update/:id", authAdmin, Project.updateProject)
router.get("/one/:id", authAdmin, Project.getProject)
router.get("/all", authAdmin, Project.getProjects)
router.delete("/one/:id", authAdmin, Project.deleteProject)
router.delete("/all", authAdmin, Project.deleteProjects)

module.exports = router;