const express = require("express");

const router = express.Router();

const oracle = require("oracledb");

const { fetchData } = require("../Connection");

router.get("/", findPrereqs);

async function findPrereqs(req, res) {
  if (typeof req.session.username === "undefined") {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  var username = req.session.username;
  const logo = "/" + username.toLowerCase() + ".png";
  const universityName = await fetchData(
    `SELECT UNI_NAME FROM UNIVERSITY WHERE UNI_CODE = (SELECT UNI_CODE FROM UNI_ADMIN WHERE USER_NAME = '${username}')`
  );
  const uni_code = await fetchData(
    `SELECT * FROM UNI_ADMIN where USER_NAME = '${username}'`
  );
  //console.log(uni_code.rows);
  const gpa = await fetchData(
    `SELECT * FROM UNI_REQUIRES WHERE UNI_CODE = '${uni_code.rows[0][1]}'`
  );
  const result = await fetchData(
    `SELECT * FROM DEPT_REQUIRES WHERE UNI_CODE = '${uni_code.rows[0][1]}'`
  );

  res.render("prereqs", {
    prereqs: result.rows,
    gpas: gpa.rows,
    title: universityName.rows,
    logo,
  });
}

module.exports = router;
