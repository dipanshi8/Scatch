const express=require("express")
const multer=require("multer")
const router = express.Router()

const storage=multer.memoryStorage()
const upload=multer({storage})

module.exports=upload