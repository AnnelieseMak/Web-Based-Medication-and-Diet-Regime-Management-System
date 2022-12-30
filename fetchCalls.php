<?php
    session_start();
    // read to json string
    $json = file_get_contents("php://input");
    $jsonVals = json_decode($json);

    if ($jsonVals->action != 'login' && !isset($_SESSION['session'])) {
        echo json_encode(["error"=>"no session set"]);
        exit();
    }

    $conn = odbc_connect('pDB','' ,'' ,SQL_CUR_USE_ODBC);
    if (!$conn) {
        echo json_encode(["error"=>"connection failed"]);
        exit();
    }

    // ACTION CALLS
    switch($jsonVals->action) {
        case "login":
            $data = login($conn, $jsonVals);
            break;
        case "logout":
            $data = logout();
            break;
        case "getPatientList":
            $data = getPatientList($conn, $jsonVals);
            break;
        case "getPatientInfo":
            $data = getPatientInfo($conn, $jsonVals);
            break;
        case "getRegime":
            $data = getRegime($conn, $jsonVals);
            break;
        case "getRound":
            $data = getRound($conn, $jsonVals);
            break;
        case "updateRound":
            $data = updateRound($conn, $jsonVals);
            break;
        case "getOptions":
            $data = getOptions($conn, $jsonVals);
            break;
        case "getOptionInfo":
            $data = getOptionInfo($conn, $jsonVals);
            break;
        case "insertRound":
            $data = insertRound($conn, $jsonVals);
            break;
        case "deleteRound":
            $data = deleteRound($conn, $jsonVals);
            break;
        case "insertPatient":
            $data = insertPatient($conn, $jsonVals);
            break;
        case "updatePatient":
            $data = updatePatient($conn, $jsonVals);
            break;
        case "verifyEditable":
            $data = verifyEditable($conn, $jsonVals);
            break;
        case "getRoundList":
            $data = getRoundList($conn, $jsonVals);
            break;
        case "getInventoryList":
            $data = getInventoryList($conn, $jsonVals);
            break;
    }

    odbc_close($conn);
    echo json_encode($data);

    /***************************************************************
                            Helper Functions
    ***************************************************************/
    function loopResults($conn, $qry) {
        $result = odbc_exec($conn, $qry);
        $data = [];
        while ($row = odbc_fetch_array($result)) {
            $data[]=$row;
        }

        return $data;
    }

    /***************************************************************
                            Auth Functions
    ***************************************************************/
    function login($conn, $jsonVals) {
        $username = $jsonVals->username;
        $password = $jsonVals->password;
        
        $qry = "SELECT PractitionerID as pId, FirstName, LastName, Photo
                FROM Practitioner
                WHERE Username='$username' AND Password='$password'";
        
        $result = odbc_exec($conn, $qry);
        $data = odbc_fetch_array($result);

        // no matching username and password
        if ($data == null) {
            return ["error"=>'username or password incorrect'];
        }

        $_SESSION['session'] = $data['pId'];
        $_SESSION['name'] = $data['FirstName']." ".$data['LastName'];
        $_SESSION['img'] = $data['Photo'];

        return $data;
    }

    function logout() {
        session_unset();
        session_destroy();

        return ["logout"=>"success"];
    }

    function verifyEditable($conn, $jsonVals) {
        $pracId = $_SESSION['session'];
        $first = $jsonVals->first;
        $last = $jsonVals->last;

        $qry = "SELECT PractitionerID
                FROM Practitioner
                WHERE firstName = '$first' AND lastName = '$last'";
        $result = odbc_exec($conn, $qry);
        $ownerPracId = odbc_result($result, "PractitionerID");

        if ($pracId == $ownerPracId) {
            return ["result"=>true];
        }

        return ["result"=>false];
    }

    /***************************************************************
                            Patient Functions
    ***************************************************************/
    function getPatientList($conn, $jsonVals) {
        $limit = $jsonVals->limit;
        $orderBy = $jsonVals->orderBy;
        $direction = $jsonVals->direction;
        
        $qry = "SELECT TOP $limit [PatientID], [LastName], [FirstName], [Sex], [DOB], [Email], [Phone]
                FROM Patient";
        if ($jsonVals->searchCat == 'patientID' && $jsonVals->searchVal != "") {
            $qry .= " WHERE $jsonVals->searchCat = $jsonVals->searchVal";
        } elseif ($jsonVals->searchCat == 'patientName' && $jsonVals->searchVal != "") {
            $qry .= " WHERE firstName LIKE '%{$jsonVals->searchVal}%' OR lastName LIKE '%{$jsonVals->searchVal}%'";
        }

        $qry .= " ORDER BY $orderBy $direction";
        
        return loopResults($conn, $qry);
    }

    function getPatientInfo($conn, $jsonVals) {
        $pId = $jsonVals->patientId;

        $qry = "SELECT *
                FROM Patient
                WHERE PatientID=$pId";
        
        $result = odbc_exec($conn, $qry);
        $data[]=odbc_fetch_array($result);

        return $data;
    }

    function insertPatient($conn, $jsonVals) {
        if (!validatePatientInfo($jsonVals)) {
            return ["error"=>"invalid inputs"];
        }

        $first = $jsonVals->first;
        $last = $jsonVals->last;
        $DOB = $jsonVals->DOB;
        $gender = $jsonVals->gender;
        $email = $jsonVals->email;
        $phone = $jsonVals->phone;
        $address = $jsonVals->address;
        $img = $jsonVals->img;
        $room = $jsonVals->room;
        $notes = $jsonVals->notes;

        $qry = "INSERT INTO Patient ([FirstName], [LastName], [DOB], [Sex], [Address], [Email], [Phone], [Photo], [Room], [MedicalHistory])
                VALUES ('$first', '$last', #$DOB#, '$gender', '$address', '$email', '$phone', '$img', $room, '$notes')";

        $result = odbc_exec($conn, $qry);

        // returns newly added patient id
        $qry2 = "SELECT TOP 1 PatientID FROM Patient ORDER BY PatientID DESC";
        $result2 = odbc_exec($conn, $qry2);
        $data[]=odbc_fetch_array($result2);

        return $data;
    }

    function updatePatient($conn, $jsonVals) {
        if (!validatePatientInfo($jsonVals)) {
            return ["error"=>"invalid inputs"];
        }

        $pId = $jsonVals->pId;
        $first = $jsonVals->first;
        $last = $jsonVals->last;
        $DOB = $jsonVals->DOB;
        $gender = $jsonVals->gender;
        $email = $jsonVals->email;
        $phone = $jsonVals->phone;
        $address = $jsonVals->address;
        $img = $jsonVals->img;
        $room = $jsonVals->room;
        $notes = $jsonVals->notes;

        $qry = "UPDATE Patient
                SET [FirstName]='$first', [LastName]='$last', [DOB]='$DOB', [Sex]='$gender', [Address]='$address', [Email]='$email', [Phone]='$phone', [Photo]='$img', [Room]=$room, [MedicalHistory]='$notes'
                WHERE PatientID = $pId";
                
        $result2 = odbc_exec($conn, $qry);
        $data = ["update"=>"success"];
        return $data;
    }

    function getRoundList($conn, $jsonVals) {
        $limit = ($jsonVals->limit >= 10) ? $jsonVals->limit : 10;
        $qry = "SELECT TOP $limit 
            RoundType, Practitioner.FirstName as PractitionerFName, Practitioner.LastName as PractitionerLName, Patient.PatientID as PatientID, 
            Patient.FirstName as PatientFName, Patient.LastName as PatientLName, RoundID, RoundName, Date, Time, Status FROM (
            SELECT * FROM (";
        $qry .= createQryTable($jsonVals);
        $qry .= filterPractitioner($jsonVals);
        $qry .= filterPatient($jsonVals);
        $qry .= filterRoundName($qry, $jsonVals);
        $qry .= filterDate($qry, $jsonVals);
        $qry .= filterStatus($qry, $jsonVals);
        $qry .= "ORDER BY Date ASC, TIME ASC, Patient.LastName ASC;";

        return loopResults($conn, $qry);
    }

    function getInventoryList($conn, $jsonVals) {
        $roundType = $jsonVals->roundType;
        $date = $jsonVals->date;

        $qry = "SELECT * FROM (SELECT {$roundType}Round.{$roundType}ID as ID, Count({$roundType}Round.Status) AS total
                FROM {$roundType}Round
                WHERE ({$roundType}Round.[Status]='completed' OR {$roundType}Round.[Status]='given')";
                
        if (!empty($date)) {
            $qry .= " AND Date = #$date#";
        }

        $qry .= " GROUP BY {$roundType}Round.{$roundType}ID) as x
                LEFT JOIN {$roundType} ON {$roundType}.{$roundType}ID = x.ID";

        $data = loopResults($conn, $qry);

        return $data;
    }

    /***************************************************************
                            Regime/Round Functions
    ***************************************************************/
    function getRegime($conn, $jsonVals) {
        $pId = $jsonVals->patientId;
        $tableName = $jsonVals->tableName;
        $d1 = $jsonVals->d1;
        $d2 = $jsonVals->d2;

        $qry = "SELECT *
                FROM ${tableName}Round
                LEFT JOIN ${tableName} ON ${tableName}Round.${tableName}ID = ${tableName}.${tableName}ID
                WHERE PatientID = $pId
                AND Date >= #$d1# AND Date < #$d2#
                ORDER BY ${tableName}.${tableName}ID ASC, Date ASC, Time ASC";
        return loopResults($conn, $qry);
    }

    function getRound($conn, $jsonVals) {
        $tableName = $jsonVals->tableName;
        $roundId = $jsonVals->roundId;
        $qry = "SELECT *
                FROM (${tableName}Round
                LEFT JOIN $tableName
                ON ${tableName}Round.${tableName}ID = ${tableName}.${tableName}ID)
                LEFT JOIN (SELECT PractitionerID as pracID, firstName, lastName
                FROM Practitioner) as prac
                ON prac.pracID = ${tableName}Round.PractitionerID
                WHERE ${tableName}RoundID = $roundId";

        return loopResults($conn, $qry);
    }

    function updateRound($conn, $jsonVals) {
        if (in_array(0, validRoundUpdate($jsonVals->time,$jsonVals->status), TRUE)) {
            return ["error"=>"invalid inputs"];
        }
        $tableName = $jsonVals->tableName;
        $roundId = $jsonVals->roundId;
        $status = $jsonVals->status;
        $time = $jsonVals->time;
        $comment = $jsonVals->comment;

        $qry = "UPDATE ${tableName}Round
                SET [Status] = '$status', [Time] = '$time', [Comment] = '$comment'
                WHERE ${tableName}RoundID = $roundId";

        $result = odbc_exec($conn, $qry);
        $data = ["update"=>"success"];
        return $data;
    }

    function getOptions($conn, $jsonVals) {
        $tableName = $jsonVals->tableName;

        $qry = "SELECT *
                FROM $tableName";

        return loopResults($conn, $qry);
    }

    function getOptionInfo($conn, $jsonVals) {
        $tableName = $jsonVals->tableName;
        $id =  $jsonVals->roundNameId;

        $qry = "SELECT *
                FROM $tableName
                WHERE ${tableName}ID = $id";
        $result = odbc_exec($conn, $qry);
        $data[]=odbc_fetch_array($result);
        return $data;
    }

    function insertRound($conn, $jsonVals) {
        if (!validateRoundInfo($jsonVals)) {
            return ["error"=>"invalid inputs"];
        }
        $tableName = $jsonVals->tableName;
        $patId = $jsonVals->patientId;
        $pracId = $jsonVals->practitionerId;
        $roundNameId = $jsonVals->roundNameId;
        $date = $jsonVals->date;
        $time = $jsonVals->time;
        $dateTime = $jsonVals->dateTime;
        $comment = $jsonVals->comment;
        $status = $jsonVals->status;

        $qry = "INSERT INTO ${tableName}Round ([PatientID], [PractitionerID], ${tableName}ID, [Date], [Time], [DateTime], [Comment], [Status])
                VALUES ($patId, $pracId, $roundNameId, #$date#, #$time#, #$dateTime#, '$comment', '$status')";

        $result = odbc_exec($conn, $qry);
        $data = ["insert"=>"success"];
        return $data;
    }

    function deleteRound($conn, $jsonVals) {
        $tableName = $jsonVals->tableName;
        $roundId = $jsonVals->roundId;

        $qry = "DELETE FROM ${tableName}Round
                WHERE ${tableName}RoundID = $roundId";

        $result = odbc_exec($conn, $qry);
        $data = ["delete"=>"success"];
        return $data;
    }

    /***************************************************************
                        VALIDATION FUNCTIONS
    ***************************************************************/
    // patient info validation
    function validatePatientInfo($jsonVals) {
        // first/last name
        $nameRegex = "/^[a-zA-Z\s\-']+$/";
        $val[] = preg_match($nameRegex, $jsonVals->first);
        $val[] = preg_match($nameRegex, $jsonVals->last);

        // DOB
        if (empty($jsonVals->DOB)) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        // gender
        $genderList = ["Female", "Male", "Other"];
        if (!empty($jsonVals->gender) && in_array($jsonVals->gender, $genderList, TRUE)) {
            $val[] = 1;
        } else {
            $val[] = 0;
        }
        // email
        $emailRegex = "/^(\w|\-|\.)+\@([a-zA-Z0-9]|\.|-)+\.([a-zA-Z]{2,4}$)/";
        $val[] = preg_match($emailRegex, $jsonVals->email);

        // phone
        $phoneRegex = "/^[0-9]+$/";
        $val[] = preg_match($phoneRegex, $jsonVals->phone);

        // address
        $addressRegex = "/^[a-zA-Z0-9\s,.'-]{3,}$/";
        $val[] = preg_match($addressRegex, $jsonVals->address);

        // room
        if (!$jsonVals->room || $jsonVals->room < 100 || $jsonVals->room > 600) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        if (in_array(0, $val, TRUE)) {
            return false;
        } else {
            return true;
        }
    }

    // round update validation (time and status inputs only)
    function validRoundUpdate($time, $status) {
        // time
        if (!$time) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        // status
        $statusList = ["Given", "Completed", "Refused", "Missed", "Future"];
        if (!empty($status) && in_array($status, $statusList, TRUE)) {
            $val[] = 1;
        } else {
            $val[] = 0;
        }

        return $val;
    }

    // round info validation (all inputs)
    function validateRoundInfo($jsonVals) {
        // round type
        if (strpos($jsonVals->tableName, 'Select') === 0) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        // round name
        if (strpos($jsonVals->roundNameId, 'Select') === 0) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        // date
        if (!$jsonVals->date) {
            $val[] = 0;
        } else {
            $val[] = 1;
        }

        $val = array_merge($val, validRoundUpdate($jsonVals->time, $jsonVals->status));

        if (in_array(0, $val, TRUE)) {
            return false;
        } else {
            return true;
        }
    }

    /***************************************************************
                    HELPER FUNCTIONS FOR ROUNDS FILTERING
    ***************************************************************/
    // Select just one type of round, or select all rounds
    function createQryTable($jsonVals) {
        if (!empty($jsonVals->type)) {
            $type = $jsonVals->type;
        $qryTable = "SELECT '$type' as RoundType, PractitionerID, PatientID, {$type}RoundID as RoundID, {$type}.{$type}Name as RoundName, Date, Time, Status FROM {$type}Round
                LEFT JOIN {$type} ON {$type}Round.{$type}ID = {$type}.{$type}ID) AS a ";
        } else {
            $qryTable = "SELECT 'Exercise' as RoundType, PractitionerID, PatientID, ExerciseRoundID as RoundID, Exercise.ExerciseName as RoundName, Date, Time, Status FROM ExerciseRound
                LEFT JOIN Exercise ON ExerciseRound.ExerciseID = Exercise.ExerciseID
                UNION ALL
                SELECT 'Meal' as RoundType, PractitionerID, PatientID, MealRoundID as RoundID, Meal.MealName as RoundName, Date, Time, Status FROM MealRound
                LEFT JOIN Meal ON MealRound.MealID = Meal.MealID
                UNION ALL
                SELECT 'Medication' as RoundType, PractitionerID, PatientID, MedicationRoundID as RoundID, Medication.MedicationName as RoundName, Date, Time, Status FROM MedicationRound
                LEFT JOIN Medication ON MedicationRound.MedicationID = Medication.MedicationID) AS a ";
        }
        return $qryTable;
    }


    // search for practioner rounds based on name or ID, or select all practitioners if not specified
    function filterPractitioner($jsonVals) {
        if (!empty($jsonVals->practitioner)) {
            $filter = strtolower($jsonVals->practitioner);
            $practitionerFilter = "LEFT JOIN Practitioner ON a.PractitionerID = Practitioner.PractitionerID
                 WHERE (a.PractitionerID LIKE '$filter' OR LCase(Practitioner.FirstName) LIKE '%$filter%' OR LCase(Practitioner.LastName) LIKE '%$filter%'))
                 AS Round ";
        } else {
            $practitionerFilter = "LEFT JOIN Practitioner ON a.PractitionerID = Practitioner.PractitionerID) AS Round ";
        }
        return $practitionerFilter;
    }

    
    // search for patient based on name or ID, or select all patients if not specified
    function filterPatient($jsonVals) {
        if (!empty($jsonVals->patient)) {
            $filter = strtolower($jsonVals->patient);
            $patientFilter = "LEFT JOIN Patient ON Round.PatientID = Patient.PatientID
                 WHERE (Round.PatientID LIKE '$filter' OR LCase(Patient.FirstName) LIKE '%$filter%' OR LCase(Patient.LastName) LIKE '%$filter%') ";
        } else {
            $patientFilter = "LEFT JOIN Patient ON Round.PatientID = Patient.PatientID ";
        }
        return $patientFilter;
    }


    // search for round name (medication, meal, exercise), or select all if not specified
    function filterRoundName($qry, $jsonVals) {
        $roundNameFilter = "";
        if (!empty($jsonVals->name)) {
            $filter = strtolower($jsonVals->name);
            if (!strpos($qry, "WHERE (Round.PatientID")) {
                $roundNameFilter .= "WHERE LCase(RoundName) LIKE '%$filter%' ";
            } else {
                $roundNameFilter .= "AND LCase(RoundName) LIKE '%$filter%' ";
            }
        }
        return $roundNameFilter;
    }


    // select rounds within start and end date range, if specified
    function filterDate($qry, $jsonVals) {
        $dateFilter = "";
        $tracker = 0;

        if (!empty($jsonVals->dateStart)) {
            $dateStart = $jsonVals->dateStart;
            if (!strpos($qry, "WHERE (Round.PatientID") && !strpos($qry, "WHERE LCase(RoundName)")) {
                $dateFilter .= "WHERE Date >= #{$dateStart}# ";
                $tracker = 1;
            } else {
                $dateFilter .= "AND Date >= #{$dateStart}# ";
            }
        }
        if (!empty($jsonVals->dateEnd)) {
            $dateEnd = $jsonVals->dateEnd;

            if (!strpos($qry, "WHERE (Round.PatientID") && !strpos($qry, "WHERE LCase(RoundName)") && $tracker == 0) {
                $dateFilter .= "WHERE Date <= #{$dateEnd} 23:59:59# ";
            } else {
                $dateFilter .= "AND Date <= #{$dateEnd} 23:59:59# ";
            }
        }

        return $dateFilter;
    }


    // select round based on status, if specified
    function filterStatus($qry, $jsonVals) {
        $statusFilter = "";
        if (!empty($jsonVals->status)) {
            $filter = $jsonVals->status;
            if ($filter == "Completed") {
                $filter = "Completed' OR Status = 'Given";
            }
            if (!strpos($qry, "WHERE (Round.PatientID") && !strpos($qry, "WHERE LCase(RoundName)") && !strpos($qry, "WHERE Date")) {
                $statusFilter .= "WHERE (Status = '$filter') ";
            } else {
                $statusFilter .= "AND (Status = '$filter') ";
            }
        }
        return $statusFilter;
    }
?>