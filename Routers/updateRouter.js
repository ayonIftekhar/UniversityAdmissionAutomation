const express = require("express");

const router = express.Router();

const {fetchData} = require("../Connection");

async function getbuetupdate(req , res){

    
    var currentUser = req.session.username;
    const logo = "/" + currentUser.toLowerCase() + ".png";
    var query = `SELECT DEPT_NAME 
        FROM UNI_ADMIN NATURAL JOIN DEPARTMENT
        WHERE USER_NAME= '${currentUser}'`;

    const universityName = await fetchData(`SELECT UNI_NAME FROM UNIVERSITY WHERE UNI_CODE = (SELECT UNI_CODE FROM UNI_ADMIN WHERE USER_NAME = '${currentUser}')`);
    

    var depts = await fetchData(query) ;
    depts = depts.rows ;
    res.render("update",{logo , depts , title : universityName.rows[0][0]});
}

router.get("/" , getbuetupdate);

router.post("/" , (req,res)=>{
    const givenAction = req.body.action ;
    const department_name = req.body.dept_id ;
    const num_seats = req.body.no_of_seats;
    const ssc_gpa = req.body.ssc_gpa;
    const hsc_gpa = req.body.hsc_gpa;
    const physics = req.body.physics;
    const chemistry = req.body.chemistry;
    const math = req.body.math;
    const biology = req.body.biology;
    const dept = req.body.dept_name;

    var currentUser = req.session.username;
    
    if(givenAction === "update"){
        updateUniversity(department_name , num_seats ,currentUser);
    }

    else if(givenAction === "update-gpa"){
        updateGpa(ssc_gpa,hsc_gpa ,currentUser);
    }

    else if(givenAction === "update-subjects"){
        updateDeptReq(physics,chemistry,math,biology,dept ,currentUser);
    }
    
    else if (givenAction === "delete") {
        deleteDept(department_name, currentUser);
    }

    res.redirect("/university");
    
});

async function updateUniversity(department_name , num_seats , username){
   
    const uni_code = await fetchData(`SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`);
    var dept_name = department_name.toUpperCase();
    var seats = parseInt(num_seats);
    var code = parseInt(uni_code.rows[0][1]);
    const result = await fetchData(`UPDATE DEPARTMENT SET TOTAL_SEAT= '${seats}', VACANT_SEAT= '${seats}' WHERE UNI_CODE = '${code}' AND DEPT_NAME= '${dept_name}'`);
    await fetchData(`COMMIT`);

}

async function updateGpa(ssc_gpa , hsc_gpa , username){
    
    const uni_code = await fetchData(`SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`);
    await fetchData(`UPDATE UNI_REQUIRES SET SSC_GPA= '${ssc_gpa}', HSC_GPA= '${hsc_gpa}' WHERE UNI_CODE = '${uni_code.rows[0][1]}'`);
    await fetchData(`COMMIT`);
}

async function updateDeptReq(phy ,chem ,math , bio,dept,username){
    
    const uni_code = await fetchData(`SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`);
    dept =dept.toUpperCase();
    await fetchData(`UPDATE DEPT_REQUIRES SET PHY_NUM ='${phy}', CHEM_NUM= '${chem}' ,BIO_NUM= '${bio}',MATH_NUM= '${math}' WHERE UNI_CODE = '${uni_code.rows[0][1]}' AND DEPT_NAME='${dept}'`);
    await fetchData(`COMMIT`);
}

async function deleteDept(department_name, username) {
    const uni_code = await fetchData(
      `SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`
    );
    var dept_name = department_name.toUpperCase();
    var code = parseInt(uni_code.rows[0][1]);
    await fetchData(
      `DELETE FROM DEPARTMENT WHERE UNI_CODE = '${code}' AND DEPT_NAME= '${dept_name}'`
    );
    await fetchData(`COMMIT`);
  }

module.exports = router ;