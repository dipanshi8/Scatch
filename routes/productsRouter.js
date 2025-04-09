const express=require('express')
const router = express.Router()
const upload =require("../config/multer-config")
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel=require("../models/product-model")

router.post("/create",upload.single("image"),async function(req,res){
    try{
        let {image,name,price,discount,bgcolor,panelcolor,textcolor} = req.body
    let product = await productModel.create({
        image:req.file.buffer,
        
        name ,
        price,
        discount,
        bgcolor,
        panelcolor,
        textcolor,
    })
    req.flash("success","Product created successfully")
    res.redirect("/owners/admin")

    }
    catch(err){
        res.send(err.message)
    }
})

router.get("/",function(req,res){
    res.send("hey its working")
})

// Render the create product form
router.get("/products/create", isLoggedIn, function (req, res) {
  const success = req.flash("success");
  const error = req.flash("error");
  res.render("createproducts", { success, error });
});

// Don't forget to export this router
module.exports = router;
