
const oracle = require("oracledb");

let databaseConnection ;
async function fetchData(query){
    if(!databaseConnection){
        databaseConnection = await oracle.getConnection({
            user          : "UniversityAdmission",
            // password      : 'ayon451133',
            password      : '1234',
            // connectString : "localhost:1521/orcl"
            connectString : "localhost:1521/orclpdb"
        });
    }
    const result = await databaseConnection.execute(query);
    return result;
}

module.exports = {
    fetchData 
} ; 