<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../styles/styles.css">
        <link rel="stylesheet" href="../styles/PatientListStyles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="../main.js" type="text/javascript"></script>
        <title>BS Health Portal</title>
    </head>
    <body id="patientList-page" class="page" onload=getAllPatients()>
        <!-- NAV BAR -->
        <?php require_once('../components/nav.php')?>
        <!-- DASHBOARD CONTENTS -->
        <div id="patientList-content-container" class="page-content-container">
            <h1 id="patients-heading" class="page-heading">PATIENTS</h1>
            <div id="patientList-options-container">
                <div class="card-design" id="patientList-toggle">
                    <div id="pl-tog-container">
                        <button id="patientView-btn" class="opt-tab" onclick="changeListView('Patient')">Patients</button>
                        <button id="roundView-btn" class="opt-tab" onclick="changeListView('Round')">Rounds</button>
                    </div>
                </div>
                <div id="patientList-filter-container">
                    <div id="filter-heading" toggle="false" onclick="toggleFilterMenu(this)">Filters</div>
                    <div id="filters-list">
                        <div id="filters-list-fields">
                            <div class="view-filter patient-filter">
                                <div class="f-title">Patient</div>
                                <input class="vf-input" id="patient-search-input" type="text" placeholder="Patient Name or ID"/></div>
                            <div class="view-filter round-filter">
                                <div class="f-title">Practitioner</div>
                                <input id="prac-filter-input" class="vf-input rf-i" type="text" placeholder="Practitioner Name or ID"/></div>
                            <div class="view-filter round-filter">
                                <div class="f-title">Start Date</div>
                                <input id="date-filter-input" class="vf-input rf-i" type="date"/></div>
                            <div class="view-filter round-filter">
                                <div class="f-title">End Date</div>
                                <input id="date-filter-input2" class="vf-input rf-i" type="date"/></div>
                            <div class="view-filter round-filter">
                                <div class="f-title">Round Type</div>
                                <select id="rt-filter-input" class="vf-select rf-i">
                                    <option value="">All</option>
                                    <option>Medication</option>
                                    <option>Meal</option>
                                    <option>Exercise</option>
                                </select>
                            </div>
                            <div class="view-filter round-filter">
                                <div class="f-title">Round Name</div>
                                <input id="rn-filter-input" class="vf-input rf-i" type="text" placeholder="Round Name"/></div>
                            <div class="view-filter round-filter">
                                <div class="f-title">Round Status</div>
                                <select id="status-filter-input" class="vf-select rf-i">
                                    <option value="">All</option>
                                    <option value="Completed">Completed/Given</option>
                                    <option>Missed</option>
                                    <option>Refused</option>
                                    <option>Future</option>
                                </select>
                            </div>
                        </div>
                        <div id="filter-btns">
                            <button class="btn-design" onclick="searchFilters()">Search</button>
                            <button class="btn-design" onclick="clearFilters()">Clear</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="pList-legend">
                <div id="pl-leg-container">
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
            <div id="patientList-card-container">
                <div id="patientList-card-pat-template" class="patientList-card patientList-head">
                    <div id="h1-patientID" title="Sort Ascending" onclick="sortList('patientID', this)" class="patientList-info sortable-row">Patient ID<a>&nbsp;&#9650;</a></div>
                    <div id="h1-lastName" title="Sort Ascending" onclick="sortList('lastName', this)" class="patientList-info sortable-row">Last Name<a>&nbsp;&#9650;</a></div>
                    <div id="h1-firstName" title="Sort Ascending" onclick="sortList('firstName', this)" class="patientList-info sortable-row">First Name<a>&nbsp;&#9650;</a></div>
                    <div class="patientList-info">Gender</div>
                    <div class="patientList-info">Date of Birth</div>
                    <div class="patientList-info" id="patientList-contact">
                        <div>Email</div>
                        <div>Phone</div>
                    </div>
                </div>
                <div id="patientList-card-round-template" class="patientList-card patientList-head">
                    <div class="patientList-info">Patient ID</div>
                    <div class="patientList-info">Patient Name</div>
                    <!-- <div class="patientList-info">First Name</div> -->
                    <div class="patientList-info">Round Type</div>
                    <div class="patientList-info">Round Name</div>
                    <div class="patientList-info">Date - Time</div>
                    <div class="patientList-info">Status</div>
                    <div class="patientList-info">Practitioner</div>
                </div>
                <div id="patient-list-container">
                    
                </div>
                <div id="patient-show-more">
                    <button class="btn-design" onclick=showMorePatients()>Show More</button>
                </div>
            </div>
        </div>
    </body>
</html>