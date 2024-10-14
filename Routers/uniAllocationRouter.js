const express = require("express");
const { session } = require("passport");
const router = express.Router();
const { fetchData } = require("../Connection");

var uni_code;

router.get("/", showAllocation);

async function showAllocation(req, res) {
  if (typeof req.session.username === "undefined") {
    req.flash("error", "Session Expired. Login Again");
    res.redirect("/");
    return;
  }

  var username = req.session.username;
  sql = `SELECT UNI_CODE FROM UNI_ADMIN WHERE USER_NAME = '${username}'`;
  result = await fetchData(sql);
  uni_code = result.rows[0][0];

  sql = `SELECT COUNT(B.ROLL) + 1 AS RANK, A.ROLL, YEAR, A.DEPT_NAME
  FROM (SELECT ROLL, YEAR, DEPT_NAME, UNI_CODE, (PHY_NUM + CHEM_NUM + BIO_NUM + MATH_NUM) AS TOTAL_MARKS
        FROM ADMITTED
                 NATURAL JOIN RESULT
        WHERE UNI_CODE = ${uni_code}) A
           LEFT OUTER JOIN
       (SELECT ROLL, DEPT_NAME, (PHY_NUM + CHEM_NUM + BIO_NUM + MATH_NUM) AS TOTAL_MARKS
        FROM ALLOCATED
                 NATURAL JOIN RESULT) B
       ON A.TOTAL_MARKS < B.TOTAL_MARKS
  GROUP BY A.ROLL, A.DEPT_NAME, A.YEAR
  ORDER BY RANK`;
  result = await fetchData(sql);
  admittedStudents = result.rows;

  sql = `SELECT COUNT(B.ROLL) + 1 AS RANK, A.ROLL, A.YEAR, A.DEPT_NAME
  FROM (SELECT ROLL, YEAR, DEPT_NAME, UNI_CODE, (PHY_NUM + CHEM_NUM + BIO_NUM + MATH_NUM) AS TOTAL_MARKS
        FROM ALLOCATED
                 NATURAL JOIN RESULT
        WHERE UNI_CODE = ${uni_code}) A
           LEFT OUTER JOIN
       (SELECT ROLL, DEPT_NAME, (PHY_NUM + CHEM_NUM + BIO_NUM + MATH_NUM) AS TOTAL_MARKS
        FROM ALLOCATED
                 NATURAL JOIN RESULT) B
       ON A.TOTAL_MARKS < B.TOTAL_MARKS
  GROUP BY A.ROLL, A.YEAR, A.DEPT_NAME
  ORDER BY RANK`;
  result = await fetchData(sql);
  allocatedStudents = result.rows;

  sql = `SELECT DEPARTMENT.DEPT_NAME,
    COUNT(DISTINCT ADMITTED.roll)                                    AS ADMITTED,
    (COUNT(DISTINCT ALLOCATED.ROLL) - COUNT(DISTINCT ADMITTED.roll)) AS Yet_to_Admit,
    VACANT_SEAT,
    number_of_waiting
    FROM UNIVERSITY
        JOIN DEPARTMENT
            ON UNIVERSITY.UNI_CODE = DEPARTMENT.UNI_CODE
        JOIN WAITINGLIST_DEPT
            ON DEPARTMENT.UNI_CODE = WAITINGLIST_DEPT.uni_code
                and DEPARTMENT.DEPT_NAME = WAITINGLIST_DEPT.dept_name
        LEFT OUTER JOIN ADMITTED
                        ON DEPARTMENT.UNI_CODE = ADMITTED.uni_code and DEPARTMENT.DEPT_NAME = ADMITTED.dept_name
        LEFT OUTER JOIN ALLOCATED
                        ON DEPARTMENT.UNI_CODE = ALLOCATED.UNI_CODE and DEPARTMENT.DEPT_NAME = ALLOCATED.DEPT_NAME
    WHERE UNIVERSITY.UNI_CODE = ${uni_code}
    GROUP BY DEPARTMENT.DEPT_NAME, DEPARTMENT.VACANT_SEAT, number_of_waiting
    ORDER BY DEPARTMENT.DEPT_NAME`;
  result = await fetchData(sql);
  totalScenarioData = result.rows;

  res.render("uni_allocation", {
    admittedStudents,
    allocatedStudents,
    totalScenarioData,
  });
}

module.exports = router;
