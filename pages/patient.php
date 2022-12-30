<?php
    $pId = isset($_GET['id']) ? $_GET['id'] : "";
    $round = isset($_GET['r']) ? $_GET['r'] : "";
?>

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../styles/PatientStyles.css">
        <link rel="stylesheet" href="../styles/styles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="../main.js" type="text/javascript"></script>
        <title>BS Health Portal</title>
    </head>
    <body class="page" onload="loadPatient('<?php echo $pId ?>', '<?php echo $round ?>')">
        <!-- NAV BAR -->
        <?php require_once('../components/nav.php')?>
        <!-- DASHBOARD CONTENTS -->
        <div id="patient-content-container" class="page-content-container">
            <div id="patient-box-1">
                <div class="card-design" id="patient-info-container">
                    <div id="patient-info-1">
                        <img id="patient-img" src="../assets/profile.png">
                        <p id="patient-name">Name</p>
                        <div id="patient-id-room">
                            <div id="patient-Id-container">ID: <a id="patient-Id"></a></div>
                            <div class="vl"></div>
                            <div id="patient-room-container">Room: <a id="patient-room"></a></div>
                        </div>
                        
                    </div>
                    <div class="vl"></div>
                    <div id="patient-info-2">
                        <div id="patient-info-2l">
                            <div class="patient-info-box">
                                <div class="patient-info-heading">Sex</div>
                                <hr>
                                <div id="patient-sex">value</div>
                            </div>
                            <div class="patient-info-box">
                                <div class="patient-info-heading">Date of Birth</div>
                                <hr>
                                <div id="patient-DOB">value</div>
                            </div>
                        </div>
                        <div id="patient-info-2r">
                            <div class="patient-info-box">
                                <div class="patient-info-heading">Email</div>
                                <hr>
                                <div id="patient-email">value</div>
                            </div>
                            <div class="patient-info-box">
                                <div class="patient-info-heading">Mobile</div>
                                <hr>
                                <div id="patient-phone">value</div>
                            </div>
                            <div class="patient-info-box">
                                <div class="patient-info-heading">Address</div>
                                <hr>
                                <div id="patient-address">value</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="patient-info-3">
                    <div id="patient-profile-btn">
                        <button class="btn-design" onclick="profileEditBtn(<?php echo $pId ?>)">Edit Profile</button>
                    </div>
                    <div class="card-design" id="patient-info-notes">
                        <div id="patient-notes-heading">Notes</div>
                        <div id="patient-notes-box">Text...</div>
                    </div>
                </div>
            </div>
            <div id="patient-box-2">
                <div class="card-design" id="patient-regime-container">
                    <div id="patient-regime-control">
                        <div id="control-1">
                            <div id="regime-toggle">
                                <button class="regime-opt" id="regime-opt-md" onclick="changeRegime('md', <?php echo $pId ?>)">Medication Regime</button>
                                <button class="regime-opt" id="regime-opt-d" onclick="changeRegime('d', <?php echo $pId ?>)">Diet Regime</button>
                            </div>
                            <button class="btn-design" onclick="newRound('<?php echo $practitioner ?>')">+</button>
                        </div>
                        <div id="control-2">
                            <div id="control-2-btn">
                                <button class="btn-design" onclick="shiftTable('left', <?php echo $pId ?>)">&#5130;</button>
                                <input id="shift-date" type="date" onchange="shiftTable('date', <?php echo $pId ?>)"/>
                                <button class="btn-design" onclick="shiftTable('right', <?php echo $pId ?>)">&#5125;</button>
                            </div>
                            <div id="table-legend">
                                <img src="../assets/status-green.png" />
                                <div>Given/Completed</div>
                                <div class="vl"></div>
                                <img src="../assets/status-red.png" />
                                <div>Refused/Missed</div>
                                <div class="vl"></div>
                                <img src="../assets/status-blue.png" />
                                <div>Future</div>
                            </div>
                        </div>
                    </div>
                    <div id="patient-regime-table">
                        <?php require_once('../components/regimeTable.html')?>
                    </div>
                </div>    
                <div class="card-design" id="patient-round-container">
                    <div id="patient-round-info">
                        <div id="patient-round-btn-container1">
                            <select id="patient-round-type" onchange="setNameOpts()">
                                <option hidden>Select Round Type</option>
                                <option>Medication</option>
                                <option>Meal</option>
                                <option>Exercise</option>
                            </select>
                            <button onclick="closeRound()" class="btn-design" id="patient-round-close-btn">X</button>
                        </div>
                        <div id="patient-round-info-1">
                            <div class="patient-round-show" id="patient-round-name">name</div>
                            <select class="patient-round-new" id="select-round-name" onchange="setDescriptionOpts()">
                                <option hidden>Select Round Name</option>
                            </select>
                            <div id="patient-round-description">description</div>
                            <div id="patient-med-extra">
                                <div>Dosage: <a id="patient-dosage"></a></div>
                                <div>Administration Method: <a id="patient-admin-method"></a></div>
                            </div>
                        </div>
                        <div id="patient-round-info-2">
                            <div id="patient-round-date-container">
                                <div class="patient-round-info-label">Date:</div>
                                <hr>
                                <input class="patient-round-new" id="select-round-date" type="date"/>
                                <div class="patient-round-show" id="patient-round-date"></div>
                            </div>
                            <div id="patient-round-time-container">
                                <div class="patient-round-info-label">Time:</div>
                                <hr>
                                <div><input id="patient-round-time" type="time"/></div>
                            </div>
                            <div id="patient-round-status-container">
                                <div class="patient-round-info-label">Status:</div>
                                <hr>
                                <div id="status-field">
                                    <select id="patient-round-status">
                                    <option hidden>Select Status</option>
                                    <option>Given</option>
                                    <option>Refused</option>
                                    <option>Missed</option>
                                    <option>Future</option>
                                    <option>Completed</option>
                                    </select>
                                    <button class="btn-design" id="round-notify-btn" onclick="sendEmail()">Notify</button>
                                </div>
                            </div>
                            <div id="patient-round-comment-container">
                                <div class="patient-round-info-label">Comments:</div>
                                <hr>
                                <div id="patient-round-comment"></div>
                            </div>
                            <div>
                                <div class="patient-round-info-label">Practitioner:</div>
                                <hr>
                                <div id="patient-round-practitioner"></div></div>
                            </div>
                    </div>
                    <div id="addRound-error">Error</div>
                    <div id="patient-round-btn-container2">
                        <button class="btn-design patient-round-show" id="round-edit-btn" onclick="editRound(<?php echo $practitionerId?>)">Edit</button>
                        <button class="btn-design patient-round-new" id ="round-add-btn" onclick="addNewRound(<?php echo $pId?>, <?php echo $practitionerId?>)">Add</button>
                        <button class="btn-design" id="round-save-btn" onclick="saveRound()">Save</button>
                        <button class="btn-design" id="round-cancel-btn" onclick="cancelRound()">Cancel</button>
                        <button class="btn-design" id="round-delete-btn" onclick="removeRound(<?php echo $pId?>)">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
