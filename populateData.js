const { query } = require("express");
const {fetchData} = require("./Connection");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { Console } = require("console");


async function encrypt_password(password) {
    const saltRounds = 10;
  
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error; 
    }
}

function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2); // Rounded to 2 decimal places
}

async function populateStudent(){
   
    for(var i=1001 ; i<=2000 ; i++){
        const roll = i ;
        const ssc_gpa = getRandomFloat(0, 5.0);
        const hsc_gpa = getRandomFloat(0, 5.0);
        const username = `student${i - 1000}`;
        var query = `INSERT INTO STUDENT VALUES('${roll}','${ssc_gpa}','${hsc_gpa}','${username}')`;
        try {
            await fetchData(query);
        }
        catch{
            console.log(`{roll} not inserted`);
        }
        // console.log(query);
        await fetchData('commit');
    }
}

async function populate_Ad_process(){
    for(var i=1001 ; i<= 2000 ; i++){
        var query = `INSERT INTO AD_PROCESS VALUES('${i}' , '${2023}')`;
        console.log(query);
        await fetchData(query);
    }
    await fetchData('commit');
}

async function populate_userInfo(){
    for(var i=1 ; i<=1000 ; i++){
        const username = `student${i}`;
        const password = await encrypt_password('1234');
        var query = `INSERT INTO USER_INFO VALUES('${username}','${password}' , 'student')`;
        await fetchData(query);
        console.log(query);
    }
    await fetchData(`COMMIT`);
}

async function populate_result(){
    for(var i=1001 ; i<= 2000 ; i++){
        const roll = i ;
        const year = 2023 ;
        const phy_num = getRandomFloat(15, 25.0);
        const chem_num = getRandomFloat(15, 25.0);
        const bio_num = getRandomFloat(15, 25.0);
        const math_num = getRandomFloat(15, 25.0);
        
        var query = `INSERT INTO RESULT VALUES('${roll}','${year}','${phy_num}','${chem_num}','${bio_num}','${math_num}')`;
        console.log(query);
        await fetchData(query);
    }
    await fetchData('commit');
}

async function populate_department(){
    for(var i=1 ; i<=4 ; i++){
        var query1 = `INSERT INTO DEPARTMENT VALUES('${i}','CSE','25','25')`;
        await fetchData(query1);
        var query2= `INSERT INTO DEPARTMENT VALUES('${i}','EEE','25','25')`;
        await fetchData(query2);
        var query3 = `INSERT INTO DEPARTMENT VALUES('${i}','CE','25','25')`;
        await fetchData(query3);
        var query4 = `INSERT INTO DEPARTMENT VALUES('${i}','ME','25','25')`;
        await fetchData(query4);
        var query5 = `INSERT INTO DEPARTMENT VALUES('${i}','BME','25','25')`;
        await fetchData(query5);
    }
    await fetchData(`COMMIT`);
    
}

async function populate_choices(){
    for(var i=1001 ; i<=2000 ; i++){
        var count=1;
        var result = await fetchData(`SELECT SSC_GPA ,HSC_GPA FROM STUDENT WHERE ROLL = '${i}'`);
        gpas = result.rows;
        
        var eligible_unis = await fetchData(`SELECT UNI_CODE FROM UNI_REQUIRES WHERE nvl(SSC_GPA, 0)<= '${gpas[0][0]}' AND nvl(HSC_GPA, 0)<= '${gpas[0][1]}'`);
        var uni = eligible_unis.rows;
        console.log(uni);

        for(var j=0 ; j<uni.length ; j++){
            var query1 = `INSERT INTO CHOICE_LIST VALUES('${count}', '${i}' , '2023', '${uni[j][0]}','CSE')`;
            await fetchData(query1);
            count++;
            var query2= `INSERT INTO CHOICE_LIST VALUES('${count}', '${i}' , '2023', '${uni[j][0]}','EEE')`;
            await fetchData(query2);
            count++;
            var query3 = `INSERT INTO CHOICE_LIST VALUES('${count}', '${i}' , '2023', '${uni[j][0]}','CE')`;
            await fetchData(query3);
            count++;
            var query4 = `INSERT INTO CHOICE_LIST VALUES('${count}', '${i}' , '2023', '${uni[j][0]}','ME')`;
            await fetchData(query4);
            count++;
            var query5 = `INSERT INTO CHOICE_LIST VALUES('${count}', '${i}' , '2023', '${uni[j][0]}', 'BME')`;
            await fetchData(query5);
            count++;
        }
    }
    await fetchData('commit');
}

// populateStudent();
// populate_Ad_process();
// populate_userInfo();
// populate_result();
// populate_department();
populate_choices();
