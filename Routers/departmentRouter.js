const express = require("express");
const oracle = require("oracledb");
const { fetchData } = require("../Connection");

const router = express.Router();

router.get("/", findDepartments);

async function findDepartments(req, res) {
  if (typeof req.session.username === "undefined") {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  var username = req.session.username;
  const universityName = await fetchData(
    `SELECT UNI_NAME FROM UNIVERSITY WHERE UNI_CODE = (SELECT UNI_CODE FROM UNI_ADMIN WHERE USER_NAME = '${username}')`
  );
  const logo = "/" + username.toLowerCase() + ".png";
  const uni_code = await fetchData(
    `SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`
  );
  process.env.CURRENT_UNI_CODE = uni_code.rows[0][1];
  //console.log(uni_code.rows);
  const result = await fetchData(
    `SELECT * FROM DEPARTMENT where UNI_CODE = '${uni_code.rows[0][1]}'`
  );

  res.render("departments", {
    departments: result.rows,
    title: universityName.rows[0][0],
    logo,
  });
}

module.exports = router;
