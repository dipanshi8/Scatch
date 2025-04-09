const express = require('express');
const router = express.Router();
const ownerModel = require("../models/owners-model");
const isLoggedIn = require("../middlewares/isLoggedIn"); // Assuming you want auth check for /admin

// Allow registering only in development
if (process.env.NODE_ENV === "development") {
    router.post("/register", async function (req, res) {
        let { fullname, email, password } = req.body;

        let createdOwner = await ownerModel.create({
            fullname,
            email,
            password,
        });

        res.status(201).send(createdOwner);
    });
}

// GET /owners/admin
router.get("/admin", isLoggedIn, function (req, res) {
    const success = req.flash("success") || [];
    const error = req.flash("error") || [];

    res.render("createproducts", { success, error });
});

module.exports = router;
