const express = require("express");
const router = express.Router();
const { fetchData } = require("../Connection");

let allocationCount;

async function studentDashboard(req, res) {
  try {
    if (typeof req.session.username === "undefined") {
      req.flash("error", "Session Expired. Login Again");
      res.redirect("/");
      return;
    }

    const studentInfo = await fetchData(
      `SELECT * FROM Student WHERE user_name = '${req.session.username}'`
    );
    if (!studentInfo.rows.length) {
      throw new Error("no studentInfo matching the username");
    }
    const roll = studentInfo.rows[0][0];

    const sessionInfo = await fetchData(
      `SELECT year FROM Ad_process WHERE roll = ${roll}`
    );
    if (!sessionInfo.rows.length) {
      throw new Error("no sessionInfo matching the roll");
    }
    const session = sessionInfo.rows[0][0];

    const testResult = await fetchData(
      `SELECT phy_num, chem_num, bio_num, math_num FROM Result WHERE roll = ${roll} AND year = ${session}`
    );

    const allocateInfo = await fetchData(
      `SELECT uni_name, dept_name FROM Allocated NATURAL JOIN UNIVERSITY WHERE roll = ${roll} AND year = ${session}`
    );
    let allocatedTo = "N/A";
    if (allocateInfo.rows.length)
      allocatedTo = `${allocateInfo.rows[0][1]},${allocateInfo.rows[0][0]}`;

    query = `SELECT variable_value FROM ADMIN
      WHERE variable_name = 'AllocationCount'`;
    data = await fetchData(query);
    if (!data.rows.length) {
      throw new Error("Error in AllocationCount");
    }
    allocationCount = data.rows[0][0];

    //storing data globally

    const studentData = {
      roll: roll,
      session: session,
      hscGPA: studentInfo.rows[0][2],
      sscGPA: studentInfo.rows[0][1],
      physics: testResult.rows[0][0],
      chemistry: testResult.rows[0][1],
      math: testResult.rows[0][3],
      biology: testResult.rows[0][2],
      allocatedTo: allocatedTo,
      result: testResult.rows,
      choicelist: null,
      flag: null, //if student already has submitted a choicelist or not
      allocationCount: allocationCount,
    };

    //check for flag
    var query = `SELECT UNI_NAME,DEPT_NAME FROM CHOICE_LIST
      NATURAL JOIN UNIVERSITY WHERE ROLL='${roll}' AND YEAR='${session}'`;
    var choice_exits = await fetchData(query);
    studentData.flag = choice_exits.rows.length;
    studentData.choicelist = choice_exits.rows;

    // Pass the studentData to the template rendering engine
    req.session.user = studentData;
    res.render("student", studentData);
  } catch (error) {
    console.error("Error in renderAdmin/get:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/");
  }
}

router.get("/", studentDashboard);

router.post("/", (req, res) => {
  const userData = req.session.user;

  if (allocationCount) {
    res.redirect("/student/see-allocation");
  } else if (userData.flag === 0) {
    res.redirect("/student/choice");
  } else {
    res.redirect("/student/choice/confirmedChoices");
  }
});

module.exports = router;
