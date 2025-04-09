const userModel=require("../models/user-model")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {generateToken}=require("../utils/generateToken")



module.exports.registerUser=async function(req,res){
    try{
        let{email,password,fullname}=req.body

        const existingUser=await userModel.findOne({email:email})
        if(existingUser){
            req.flash("error", "You already have an account, please login!");
            return res.redirect("/");
        }
            

        bcrypt.genSalt(10,function(err,salt){
            bcrypt.hash(password,salt,async function(err,hash){
                if(err)return res.send(err.message)
                
                    let user =await userModel.create({
                        email,
                        password:hash,
                        fullname,
                    })
                    let token=generateToken(user)

                    res.cookie("token",token)
                    req.flash("success","user created succesfully")
                    return res.redirect("/")
            })
            })
        
    }catch(err){
        res.send(err.message)
    }
}

module.exports.loginUser = async function (req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
  
      if (!user) {
        req.flash("error", "Email or Password is incorrect!");
        return res.redirect("/");
      }
  
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          console.error("bcrypt compare error:", err);
          req.flash("error", "Something went wrong!");
          return res.redirect("/");
        }
  
        if (result) {
          const token = generateToken(user);
          res.cookie("token", token);
          req.flash("success", "Login successful!");
          return res.redirect("/shop"); // 🔥 THIS is the redirect after success
        } else {
          req.flash("error", "Email or Password is incorrect!");
          return res.redirect("/");
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      req.flash("error", "Something went wrong!");
      return res.redirect("/");
    }
  };
  

  module.exports.logout = function(req, res) {
    res.clearCookie("token"); // Clear the JWT token
    req.flash("success", "You have been logged out.");
    res.redirect("/");
}
