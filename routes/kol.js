const express = require('express');
const {
    getKOLs,
    createKOL,
    updateKOL,
    deleteKOL
} = require('../controllers/kol');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', getKOLs);
router.post('/', createKOL);
router.put('/:id', updateKOL);
router.delete('/:id', deleteKOL);

module.exports = router;