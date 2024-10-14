const express = require("express");
const router = express.Router();
const { fetchData } = require("../Connection");

var allocatedDept, roll, year;

router.get("/", showAllocation);

async function showAllocation(req, res) {
  try {
    const userData = req.session.user;
    roll = userData.roll;
    year = userData.session;
    admissionConfirmed = false;

    query = `SELECT DEPT_NAME, UNI_NAME
      FROM ALLOCATED NATURAL JOIN UNIVERSITY
      WHERE ROLL = ${roll} AND YEAR = ${year}`;
    result = await fetchData(query);
    allocatedDept = result.rows;

    query = `SELECT PRIORITY, UNI_NAME, DEPT_NAME, POSITION
    FROM WAITINGLIST_STUDENT NATURAL JOIN CHOICE_LIST NATURAL JOIN UNIVERSITY
    WHERE ROLL = ${roll} AND YEAR = ${year}
    ORDER BY PRIORITY`;
    result = await fetchData(query);
    waitingList = result.rows;

    if (!allocatedDept.length) {
      // if not allocated anywhere
      res.render("see-allocation", { waitingChoices : waitingList });
      return;
    }

    query = `SELECT DEPT_NAME, UNI_NAME
    FROM ADMITTED NATURAL JOIN UNIVERSITY
    WHERE ROLL = ${roll} AND YEAR = ${year}`;
    result = await fetchData(query);
    admittedDept = result.rows;

    if (admittedDept.length) admissionConfirmed = true;

    var str = admissionConfirmed ? "Admitted" : "Allocated";
    waitingList.push([
      waitingList.length + 1,
      allocatedDept[0][1],
      allocatedDept[0][0],
      str,
    ]);

    const data = {
      deptName: allocatedDept,
      waitingChoices: waitingList,
      admissionConfirmed: admissionConfirmed,
    };

    res.render("see-allocation", data);
  } catch (error) {
    console.error("Error in see-allocation route:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/");
  }
}

router.post("/", confirmAdmission);

async function confirmAdmission(req, res) {
  try {
    const formData = req.body;
    if (formData.migration === "off") {
      query = `DELETE FROM CHOICE_LIST
      WHERE ROLL = ${roll} AND YEAR = ${year}`;
      await fetchData(query);

      query = `DELETE FROM WAITINGLIST_STUDENT
      WHERE ROLL = ${roll} AND YEAR = ${year}`;
      await fetchData(query);
    }

    result = await fetchData(`SELECT uni_code FROM UNIVERSITY
      WHERE uni_name = '${allocatedDept[0][1]}'`);
    allocatedUni = result.rows[0][0];

    await fetchData(`INSERT INTO ADMITTED VALUES
      (${roll}, ${year}, ${allocatedUni}, '${allocatedDept[0][0]}')`);

    await fetchData("commit");
    res.redirect("/student/see-allocation");
  } catch (error) {
    console.error("Error in see-allocation route:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/");
  }
}

module.exports = router;
