const userModel=require("../models/user-model")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const {generateToken}=require("../utils/generateToken")



module.exports.registerUser=async function(req,res){
    try{
        let{email,password,fullname,gender,age}=req.body

        const existingUser=await userModel.findOne({email:email})
        if(existingUser){
            req.flash("error", "You already have an account, please login!");
            return res.redirect("/login");
        }
            
        // Validate age
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
            req.flash("error", "Age must be between 13 and 120.");
            return res.redirect("/register");
        }

        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                console.error("Bcrypt salt error:", err);
                req.flash("error", "Error creating account. Please try again.");
                return res.redirect("/register");
            }
            
            bcrypt.hash(password, salt, async function(err, hash) {
                if (err) {
                    console.error("Bcrypt hash error:", err);
                    req.flash("error", "Error creating account. Please try again.");
                    return res.redirect("/register");
                }
                
                try {
                    let user = await userModel.create({
                        email,
                        password: hash,
                        fullname,
                        gender: gender || 'Prefer not to say',
                        age: ageNum
                    });
                    let token = generateToken(user);
                    console.log('🔐 [registerUser] Token generated for new user:', user.email);

                    // Set cookie with proper options for localhost (cookie name must be "token")
                    res.cookie("token", token, {
                      httpOnly: true,
                      secure: false, // Must be false for localhost (non-https)
                      maxAge: 24 * 60 * 60 * 1000, // 24 hours
                      sameSite: 'lax'
                    });
                    console.log('🍪 [registerUser] Cookie "token" set successfully');
                    console.log('✅ [registerUser] Registration successful, redirecting to /shop');
                    
                    req.flash("success", "Account created successfully! Welcome!");
                    // Auto-login and redirect to shop after registration
                    return res.redirect("/shop");
                } catch (createErr) {
                    console.error("User creation error:", createErr);
                    req.flash("error", "Error creating account. Please try again.");
                    return res.redirect("/register");
                }
            });
        });
    } catch (err) {
        console.error("Registration error:", err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/register");
    }
}

module.exports.loginUser = async function (req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
  
      if (!user) {
        req.flash("error", "Email or Password is incorrect!");
        return res.redirect("/login");
      }
  
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          console.error("bcrypt compare error:", err);
          req.flash("error", "Something went wrong!");
          return res.redirect("/login");
        }
  
        if (result) {
          const token = generateToken(user);
          console.log('🔐 [loginUser] Token generated for user:', user.email);
          
          // Set cookie with proper options for localhost (cookie name must be "token")
          res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Must be false for localhost (non-https)
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
          });
          console.log('🍪 [loginUser] Cookie "token" set successfully');
          console.log('✅ [loginUser] Login successful, redirecting to /shop');
          
          req.flash("success", "Login successful!");
          return res.redirect("/shop"); // 🔥 THIS is the redirect after success
        } else {
          req.flash("error", "Email or Password is incorrect!");
          return res.redirect("/login");
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      req.flash("error", "Something went wrong!");
      return res.redirect("/login");
    }
  };
  

  module.exports.logout = (req, res) => {
    res.clearCookie("token");
    res.clearCookie("connect.sid");

    // Direct redirect. No callbacks, no flash.
    return res.redirect("/login");
  };
