<?php
    $pId = isset($_GET['id']) ? $_GET['id'] : "";
    $buttonText = isset($_GET['id']) ? "Update" : "Register";
?>

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../styles/styles.css">
        <link rel="stylesheet" href="../styles/patientFormStyles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="../main.js" type="text/javascript"></script>
        <title>BS Health Portal</title>
    </head>
    <body id="patientform-page" class="page" onload="patientFormInput(<?php echo $pId?>)">
        <!-- NAV BAR -->
        <?php require_once('../components/nav.php')?>
        <!-- DASHBOARD CONTENTS -->
        <div id="patient-form-content-container" class="page-content-container">
            <h1 class="page-heading">PATIENT FORM</h1>
            <div id="patient-form" class="card-design">
                <div id="patient-form-field-container">
                    <div id="form-error">ERROR: Patient <?php echo $buttonText?> Failed</div>
                    <div class="patient-form-row">
                        <div id="patient-name-row">
                            <div class="patient-form-field">
                                <div class="patient-form-label">First Name<a class="form-required"> *</a></div>
                                <hr class="hl">
                                <div class="patient-form-a">
                                    <div><input class="patient-form-input" id="patient-form-fName" placeholder="Enter First Name" onchange="validateName('fName', this.value)"/></div>
                                    <div class="patient-form-error" id="fName-error">Error Message</div>
                                </div>
                            </div>
                            <div class="patient-form-field">
                                <div class="patient-form-label">Last Name<a class="form-required"> *</a></div>
                                <hr class="hl">
                                <div class="patient-form-a">
                                    <div><input class="patient-form-input" id="patient-form-lName" placeholder="Enter Last Name" onchange="validateName('lName', this.value)"/></div>
                                    <div class="patient-form-error" id="lName-error">Error Message</div>
                                </div>
                            </div>
                        </div>
                        <div id="patient-form-profile">
                            <img src="#" id="preview-img" alt="profile image"/>
                            <div id="form-img-btns">
                                <input id="patient-form-img" type="file" accept=".jpg, .jpeg, .png" onchange="previewImg()">
                                <button class="btn-design" onclick="clearProfileImg()">Clear</button>
                            </div>
                        </div>
                    </div>
                    <div class="patient-form-row">
                        <div class="patient-form-field">
                            <div class="patient-form-label">Date of Birth<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><input class="patient-form-input" id="patient-form-DOB" type="date" onchange="validateDOB(this.value)"/></div>
                                <div class="patient-form-error" id="DOB-error">Error Message</div>
                            </div>
                        </div>
                        <div class="patient-form-field">
                            <div class="patient-form-label">Gender<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <form id="patient-form-gender">
                                    <input type="radio" name="gender" value="Male" id="gender-male"/>
                                    <label for="gender-male">Male</label>
                                    <input type="radio" name="gender" value="Female" id="gender-female"/>
                                    <label for="gender-female">Female</label>
                                    <input type="radio" name="gender" value="Other" id="gender-other"/>
                                    <label for="gender-other">Other</label>
                                </form>
                                <div class="patient-form-error" id="gender-error">Error Message</div>
                            </div>
                        </div>
                    </div>
                    <div class="patient-form-row">
                        <div class="patient-form-field">
                            <div class="patient-form-label">Email<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><input class="patient-form-input" id="patient-form-email" placeholder="Enter Email" onchange="validateEmail(this.value)"/></div>
                                <div class="patient-form-error" id="email-error">Error Message</div>
                            </div>
                        </div>
                        <div class="patient-form-field">
                            <div class="patient-form-label">Phone<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><input class="patient-form-input" id="patient-form-phone" placeholder="Enter Phone Number" onchange="validatePhone(this.value)"/></div>
                                <div class="patient-form-error" id="phone-error">Error Message</div>
                            </div>
                        </div>
                    </div>
                    <div class="patient-form-row">
                        <div class="patient-form-field">
                            <div class="patient-form-label">Address<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><input class="patient-form-input" id="patient-form-address" placeholder="Enter Address" onchange="validateAddress(this.value)"/></div>
                                <div class="patient-form-error" id="address-error">Error Message</div>
                            </div>
                        </div>
                    </div>
                    <div class="patient-form-row" id="row-room">
                        <div class="patient-form-field">
                            <div class="patient-form-label">Room<a class="form-required"> *</a></div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><input type="number" min="100" class="patient-form-input" id="patient-form-room" placeholder="Room Number" onchange="validateRoom(this.value)"/></div>
                                <div class="patient-form-error" id="room-error">Error Message</div>
                            </div>
                        </div>
                    </div>
                    <div class="patient-form-row">
                        <div class="patient-form-field">
                            <div class="patient-form-label">Notes</div>
                            <hr class="hl">
                            <div class="patient-form-a">
                                <div><textarea class="patient-form-input" id="patient-form-mh" placeholder="Notes"></textarea></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="reg-btn-container"><button class="btn-design" id="patient-register-btn" onclick="registerPatient('<?php echo $buttonText?>', <?php echo $pId?>)"><?php echo $buttonText?></button></div>
            </div>
        </div>
    </body>
</html>