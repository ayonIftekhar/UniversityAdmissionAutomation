const express = require("express");
const session = require("express-session");
const router = express.Router();
const {fetchData} = require("../Connection");
 

router.get("/", async(req, res)=>{
    if (typeof req.session.username === "undefined") {
        req.flash("error", "Session Expired. Login Again");
        res.redirect("/");
        return;
      }

    var userData = req.session.user ;
    var query = `SELECT UNI_NAME,DEPT_NAME FROM CHOICE_LIST NATURAL JOIN UNIVERSITY WHERE ROLL='${req.session.user.roll}' AND YEAR='${req.session.user.session}'`;
    var choice_exits = await fetchData(query) ;

    
    res.render("choicelist",{choice : choice_exits.rows , session : userData.session , roll : userData.roll});
});

router.post("/",async (req,res)=>{

    const userData = req.session.user;
    req.session.choicelist = [];
    var query = `DELETE FROM CHOICE_LIST WHERE ROLL='${userData.roll}' AND YEAR='${userData.session}'`;
    await fetchData(query);
    await fetchData('COMMIT');

    const responseData = {
        message: 'Data processed successfully',
        redirectTo: '/student/choice',
    }
    res.status(200).json(responseData);
  
  });
  


module.exports = router;   