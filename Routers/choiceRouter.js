const express = require("express");
const router = express.Router();
const { fetchData } = require("../Connection");

router.get("/", findChoicesOptions);

async function findChoicesOptions(req, res) {
  if (typeof req.session.username === "undefined") {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  const userData = req.session.user;
  var roll = userData.roll;
  var ssc_gpa = userData.sscGPA;
  var hsc_gpa = userData.hscGPA;
  var session = userData.session;
  var result = userData.result;

  var query = `SELECT UNI_NAME , DEPT_NAME
    FROM UNIVERSITY NATURAL JOIN DEPT_REQUIRES NATURAL JOIN UNI_REQUIRES
    WHERE NVL(SSC_GPA, 0) <= ${ssc_gpa} AND NVL(HSC_GPA, 0) <= ${hsc_gpa}
    AND NVL(PHY_NUM, 0) <= ${result[0][0]} AND NVL(CHEM_NUM, 0) <= ${result[0][1]} AND NVL(BIO_NUM, 0) <= '${result[0][2]}' AND NVL(MATH_NUM, 0) <= ${result[0][3]}`;

  var universityList = await fetchData(
    `SELECT DISTINCT(UNI_NAME) FROM UNIVERSITY`
  );
  var eligibleArray = await fetchData(query);

  res.render("choices", {
    depts: eligibleArray.rows,
    unis: universityList.rows,
  });
}

router.post("/", fetchedChoices);

async function fetchedChoices(req, res) {
  const userData = req.session.user;

  const orderedItems = req.body;

  res.json({ orderedItems });

  //WRITING CHOICES INTO DATABASE
  const roll = userData.roll;
  const session = userData.session;
  userData.choicelist = orderedItems;

  for (var i = 0; i < userData.choicelist.length; i++) {
    var priority = i + 1;
    const uni_dept = userData.choicelist[i].split("-");
    var query = `SELECT UNI_CODE FROM UNIVERSITY WHERE UNI_NAME='${uni_dept[0]}'`;
    var uni_code = await fetchData(query);
    var query2 = `INSERT INTO CHOICE_LIST VALUES('${priority}','${roll}','${session}','${uni_code.rows[0][0]}','${uni_dept[1]}')`;
    await fetchData(query2);
    await fetchData("COMMIT");
  }
}

module.exports = router;
