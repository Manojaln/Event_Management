const express = require('express');
const router = express.Router();
const { createRegistration, deleteRegistration } = require('../handlers/registration.handler');
const { verifyToken } = require("../../middlewares/authorizationHandler");

router.delete('/:eventId', verifyToken, deleteRegistration);
router.post('/', verifyToken, createRegistration);


module.exports = router;
