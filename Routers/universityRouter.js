const express = require("express");
const { fetchData } = require("../Connection");
const router = express.Router();

async function getBuet(req, res) {
  if (typeof req.session.username === "undefined") {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  var currentUser = req.session.username;

  // const uni_code = await fetchData(`SELECT * FROM UNI_ADMIN where USER_NAME = '${currentUser}'`);
  // const universityName = await fetchData(`SELECT UNI_NAME FROM UNIVERSITY where UNI_CODE = '${uni_code.rows[0][1]}'`);
  const universityName = await fetchData(
    `SELECT UNI_NAME FROM UNIVERSITY WHERE UNI_CODE = (SELECT UNI_CODE FROM UNI_ADMIN WHERE USER_NAME = '${currentUser}')`
  );
  const username = currentUser.toLowerCase();

  var website = "https://www." + username + ".ac.bd/";
  var logo = "/" + username + ".png";

  process.env.LOGO = logo;

  query = `SELECT get_allocated_count() FROM dual`;
  data = await fetchData(query);
  allocatedStudentCount = data.rows[0][0];

  res.render("university", {
    name: universityName.rows[0][0],
    website,
    logo,
    allocatedStudentCount,
  });
}

router.get("/", getBuet);

module.exports = router;
