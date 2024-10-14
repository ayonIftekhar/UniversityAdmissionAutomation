const express = require("express");
const { fetchData } = require("../Connection");
const router = express.Router();

let allocationCount = 0;

async function renderAdmin(req, res) {
  try {
    if (
      typeof req.session.username === "undefined" ||
      req.session.username !== "admin"
    ) {
      req.flash("error", "Session Expired. Login Again");
      res.redirect("/");
      return;
    }

    let query = `SELECT roll, year, uni_name, dept_name
      FROM ALLOCATED NATURAL JOIN UNIVERSITY`;
    let data = await fetchData(query);
    const allocatedStudents = data.rows;

    query = `SELECT get_not_allocated_count() FROM dual`;
    data = await fetchData(query);
    const notAllocatedCount = data.rows[0][0];

    query = `SELECT get_allocated_count() FROM dual`;
    data = await fetchData(query);
    const allocatedStudentCount = data.rows[0][0];

    query = `SELECT variable_value FROM ADMIN
      WHERE variable_name = 'AllocationCount'`;
    data = await fetchData(query);
    allocationCount = data.rows[0][0];

    query = `SELECT UNI_NAME, DEPT_NAME, VACANT_SEAT, NUMBER_OF_WAITING
      FROM DEPARTMENT NATURAL JOIN UNIVERSITY NATURAL JOIN WAITINGLIST_DEPT
      ORDER BY UNI_NAME`;
    data = await fetchData(query);
    const departmentScenario = data.rows;

    res.render("admin", {
      data: allocatedStudents,
      notAllocatedCount: notAllocatedCount,
      allocatedStudentCount: allocatedStudentCount,
      departmentScenario: departmentScenario,
      allocationCount: allocationCount,
    });
  } catch (error) {
    // Handle errors here
    console.error("Error in renderAdmin/get:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/");
  }
}

async function allocate(req, res) {
  try {
    let query;
    if (allocationCount === 0) {
      query = `BEGIN
      EMPTYALLOCATION();
      ALLOCATESTUDENTSTODEPARTMENTS();
      end;`;
    } else {
      query = `BEGIN
      NTHCALL();
      end;`;
    }
    await fetchData(query);
    await fetchData("commit");

    renderAdmin(req, res);
  } catch (error) {
    // Handle errors here
    console.error("Error in renderAdmin/post:", error);
    req.flash("error", "Internal Server Error");
    res.redirect("/");
  }
}

router.get("/", renderAdmin);
router.post("/", allocate);

module.exports = router;
