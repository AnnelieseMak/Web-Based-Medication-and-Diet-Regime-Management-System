<?php
    session_start();
    $practitioner = isset($_SESSION['name']) ? $_SESSION['name'] : "PRACTITIONER NAME";
    $practitionerId = "none";
    $profileImg = isset($_SESSION['img']) ? $_SESSION['img'] : "../assets/doctor.png";
    if (isset($_SESSION['session'])) {
        $practitionerId = $_SESSION['session'];
        ini_set('odbc.defaultlrl', '2000000');
    } else {
        require_once('../components/pageModal.html');
    }
?>
<!DOCTYPE html>
<html>
    <div id="nav-bar">
        <div id="nav-1">
            <div id="nav-practitioner">
                <img src=<?php echo $profileImg?> id="nav-img">
                <p id="nav-practitioner-name"><?php echo $practitioner ?></p>
            </div>
            <a class="nav-link">PROFILE</a>
            <a class="nav-link" href="../pages/patientList.php">LISTS</a>
            <a class="nav-link" href="../pages/patientForm.php">PATIENT FORM</a>
            <a class="nav-link" href="../pages/inventory.php">INVENTORY</a>
        </div>
        <div id="nav-2">
            <a class="nav-link">&#9881; <b class="nav-title">SETTINGS</b></a>
            <a class="nav-link" onclick=logout()>&#x25c0; <b class="nav-title">LOGOUT</b></a>
        </div>
    </div>
</html>