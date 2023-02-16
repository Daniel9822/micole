const { Router } = require("express");
const pkg = require("../../package.json");

const authRouter = require("./authRoutes");

const colegioRouter = require("./colegio.js");
const departamentoRouter = require("./departamento.js");
const provinciaRouter = require("./provincia.js");
const paisRouter = require("./pais.js");

const router = Router();

router.use("/colegios", colegioRouter);
router.use("/departamentos", departamentoRouter);
router.use("/provincias", provinciaRouter);
router.use("/paises", paisRouter);

router.get("/", (req, res) =>
  res.json({ name: pkg.name, version: pkg.version })
);
router.use("/auth", authRouter);

module.exports = router;
