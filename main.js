const defaultSearchResults = 13;
const staticDate = '12/7/2022';

/***************************************************************
                CALLS FROM HTML FILE (onclick/onloads)
***************************************************************/
// FROM pageModal.html
// redirect to login page
const modalBtn = () => {
    document.getElementById('modal-container').style.display = "none";
    window.location = "login.php";
}

// FROM: login.php
// log in practitioner if valid username and password
const login = () => {
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;

    if (!username || !password) {
        document.getElementById('login-error').style.display = "block";
        return;
    }

    practitionerLogin(username, password).then(ret => {
        if (ret.error) {
            document.getElementById('login-error').style.display = "block";
        } else {
            window.location = "patientList.php";
        }
    })
}

// FROM: navbar.php
// log out practitioner
const logout = () => {
    practitionerLogout().then(ret => {
        if (ret.logout == 'success') {
            window.location = 'login.php';
        }
    });
}

// FROM: onclick of patientList.php
// change list view based on toggled button
const changeListView = (view) => {
    sortingRowDefault();
    resetFilterVals();
    const pat = document.getElementById('patientList-card-pat-template');
    const round = document.getElementById('patientList-card-round-template');
    pat.classList.remove('view-active');
    round.classList.remove('view-active');
    const patBtn = document.getElementById('patientView-btn');
    const roundBtn = document.getElementById('roundView-btn');
    roundBtn.style.backgroundColor = '';
    patBtn.style.backgroundColor = '';

    if (view == "Round") {
        round.classList.add('view-active');
        roundBtn.style.backgroundColor = 'white';
        filtersOptions(view);
        loadListRound(defaultSearchResults);
    } else {
        loadListPatient(defaultSearchResults, 'patientID', 'ASC', '', '');
        pat.classList.add('view-active');
        
        setActiveSortingField(document.getElementById('h1-patientID'));
        patBtn.style.backgroundColor = 'white';
        filtersOptions(view);
    }
}

// FROM: onload patientList.php
// load default number of patients
const getAllPatients = () => {
    changeListView('Patient');
}

// FROM: onclick patientList.php show more button
// showing more patients on click
const showMorePatients = () => {
    const activeView = document.getElementsByClassName('view-active')[0].id.split('-')[2];
    let container = document.getElementById('patient-list-container');
    let limit = container.childElementCount + 7;
    const [searchCat, searchVal] = getFilterParams()
    const [orderBy, direction] = getActiveSortingField();

    if (activeView == "pat") {
        getPatientList(limit, orderBy, direction, searchCat[0], searchVal[0]).then(ret => {
            displayPatientList(ret);
        });
    } else {
        loadListRound(limit);
    }
}

// FROM onclick of patientList.php
// sort patient list in asc/desc order of the clicked field
const sortList = (orderBy, elem) => {
    const [sortDirection, newTitle] = determineOrderDirection((elem.title).slice(5));
    setActiveSortingField(elem);

    elem.children[0].innerHTML = sortDirection == "ASC" ? '&nbsp;&#9650;' : '&nbsp;&#9660;';
    elem.setAttribute('title', `Sort ${newTitle}`);

    const curLimit = document.getElementById('patient-list-container').childElementCount;

    const [searchCat, searchVal] = getFilterParams();
    loadListPatient(curLimit, orderBy, sortDirection, searchCat[0], searchVal[0]);
}

// FROM: onclick of patientList.php - search button
// apply search filters
const searchFilters = () => {
    const activeView = document.getElementsByClassName('view-active')[0].id.split('-')[2];
    
    if (activeView == "pat") {
        const [searchCat, searchVal] = getFilterParams();
        sortingRowDefault();
        loadListPatient(defaultSearchResults, 'PatientID', 'ASC', searchCat[0], searchVal[0]);
    } else {
        sortingRowDefault();
        loadListRound(defaultSearchResults);
    }
}

// FROM: onclick of patientList.php
// clear filter inputs
const clearFilters = () => {
    resetFilterVals();
    sortingRowDefault();
    
    const activeView = document.getElementsByClassName('view-active')[0].id.split('-')[2];
    if (activeView == 'round') {
        loadListRound(defaultSearchResults);
        return;
    }
    
    getAllPatients();
}

// FROM: onload of patient.php
// get patient information of id
// default loads medication regime
const loadPatient = (pId, round) => {
    if (!pId) {
        return;
    }
    
    getPatientInfo(pId).then(ret => {
        displayPatientInformation(ret[0]);
    });
    loadRegimeAll('md', pId, staticDate);
    shiftToggle('md');
    if (round) {
        roundInfo(round);
    }
}

// FROM onclick of patientList.php
// show hide filter menu
const toggleFilterMenu = (elem) => {
    const filterMenu = document.getElementById('filters-list');
    if (elem.getAttribute('toggle') == 'false') {
        elem.setAttribute('toggle', 'true')
        filterMenu.style.display = 'flex';
    } else if (elem.getAttribute('toggle') == 'true') {
        elem.setAttribute('toggle', 'false')
        filterMenu.style.display = 'none';
    }
}

// FROM: onclick of patient.php
// change view
const changeRegime = (regime, pId) => {    
    let centerDate = getCurCenterDateString();
    let [d1, d2] = getDateRange(centerDate);

    removeClones('table-container', 2);

    loadRegime(regime, pId, d1, d2);
    shiftToggle(regime);
    
}

// FROM: onclick of patient.php
// shift table dates
const shiftTable = (shift, pId) => {    
    let newFormatDate;

    if (shift == 'date') {
        const date = document.getElementById("shift-date").value;
        const [y, m ,d] = date.split('-');
        newFormatDate = `${m}/${d}/${y}`;
    } else {
        let curCenterDate = new Date(getCurCenterDateString());
        if (shift == 'left') {
            curCenterDate.setDate(curCenterDate.getDate() - 1);
        } else {
            curCenterDate.setDate(curCenterDate.getDate() + 1);
        }

        let newDate = curCenterDate.getDate();
        let newMonth = curCenterDate.getMonth() + 1;
        let newYear = curCenterDate.getFullYear();
        newFormatDate = `${newMonth}/${newDate}/${newYear}`;
    }

    const curRegime = document.getElementById('regime-toggle').getAttribute('toggle');

    // load regime
    loadRegimeAll(curRegime, pId, newFormatDate);
}

// FROM: onclick of patient.php - table cell info
// display round info
const roundInfo = (info) => {
    document.getElementById('addRound-error').style.display = "none";
    roundDetailsUneditable();
    const infoSplit = info.split('-');
    const regimeFull = convertIdAndFull(infoSplit[0], 'short');

    getRound(regimeFull, infoSplit[1]).then(data => {
        setRoundInfo(data[0], regimeFull, infoSplit[1]);
    })
}

// FROM: onclick of patient.php - round details edit button
// enable round details editable
const editRound = () => {
    const status = document.getElementById('patient-round-status');
    status.disabled = false;
    status.style.border = '1px solid red';
    const time = document.getElementById('patient-round-time');
    time.disabled = false;
    time.style.border = '1px solid red';
    const comment = document.getElementById('patient-round-comment');
    comment.setAttribute('contenteditable', true);
    comment.style.border = '1px solid red';
    document.getElementById('round-save-btn').style.display = 'block';
    document.getElementById('round-cancel-btn').style.display = 'block';
    document.getElementById('round-delete-btn').style.display = 'block';
}

// FROM: onclick of patient.php - round details save button
// enable round details editable
const saveRound = () => {
    roundDetailsUneditable();
    //add to database
    const status = document.getElementById('patient-round-status').value;
    const time = document.getElementById('patient-round-time').value;
    const comment = document.getElementById('patient-round-comment').innerText;

    const tableType = document.getElementById('patient-round-container').getAttribute('data-type');
    const tableName = convertIdAndFull(tableType, 'short');
    const roundID = document.getElementById('patient-round-container').getAttribute('data-id');

    updateRound(tableName, roundID, status, time, comment).then(data => {
        if (data.error) {
            document.getElementById('addRound-error').innerText = 'Error: Update Failed';
            document.getElementById('addRound-error').style.display = "block";
        } else {
            closeRound();
            updateCellData(tableType, roundID, status, time);
        }
    });
}

// FROM onclick of patient.php - round details add button 
// add new round to patient
const addNewRound = (patId, pracId) => {
    verifyNewRoundInputs(patId, pracId);
}

// FROM onclick of patient.php - round details close button
// close round details panel
const closeRound = () => {
    roundDetailsUneditable();
    document.getElementById('patient-round-container').style.display = 'none';
}

// FROM onclick of patient.php - round details cancel button
// cancel round editing - resetting to current values
const cancelRound = () => {
    const regime = document.getElementById('patient-round-container').getAttribute('data-type');
    const roundId = document.getElementById('patient-round-container').getAttribute('data-id');
    if (!regime && !roundId) {
        closeRound();
        return;
    }
    roundInfo(`${regime}-${roundId}`);
}

// FROM onclick of patient.php - '+' button
// add a round
const newRound = (prac) => {
    document.getElementById('round-notify-btn').style.display = "none";
    roundDetailsUneditable();
    setUpRoundAdd(prac);
}

// FROM: onclick of patient.php - delete button
// delete selected round
const removeRound = (patId) => {
    const tableName = document.getElementById('patient-round-container').getAttribute('data-type');
    const roundId = document.getElementById('patient-round-container').getAttribute('data-id');
    deleteRound(convertIdAndFull(tableName, 'short'), roundId).then(ret => {
        closeRound();
        const curRegime = document.getElementById('regime-toggle').getAttribute('toggle');
        const center = getCurCenterDateString();
        loadRegimeAll(curRegime, patId, center)

    })
}

// FROM onclick of patient.php
// edit profile
const profileEditBtn = (pId) => {
    if (pId) {
        window.location=`patientForm.php?id=${pId}`;
    }
}

// FROM onload of patientForm.php
// load form if patient id passed in to update, otherwise is new patient form
const patientFormInput = (pId) => {
    if (pId) {
        insertFormValues(pId)
    }
}

// FROM onclick of patientForm.php
// ensure inputs are valid before registering a new patient
const registerPatient = (formType, pId) => {    
    const first = document.getElementById('patient-form-fName').value;
    const last = document.getElementById('patient-form-lName').value;
    const DOB = document.getElementById('patient-form-DOB').value;

    const genderOpt = document.getElementsByName('gender');
    let gender;
    for (let i = 0; i < genderOpt.length; i++) {
        if (genderOpt[i].checked) {
            gender = genderOpt[i].value;
        }
    }

    const email = document.getElementById('patient-form-email').value;
    const phone = document.getElementById('patient-form-phone').value;
    const address = document.getElementById('patient-form-address').value;
    const room = document.getElementById('patient-form-room').value;

    let valid = [];
    valid.push(validateName('fName', first))
    valid.push(validateName('lName', last))
    valid.push(validateDOB(DOB));
    valid.push(validateGender(gender));
    valid.push(validateEmail(email));
    valid.push(validatePhone(phone));
    valid.push(validateAddress(address));
    valid.push(validateRoom(room))
    
    if (valid.includes(false)) {
        return;
    }

    let img = "";
    if (formType == "Update") {
        img = document.getElementById('preview-img').src
        if (!img.startsWith("data:image")) {
            img = "";
        }
    } else {
        const imgInput = document.getElementById('patient-form-img').files[0];
        if (imgInput) {
            img = document.getElementById('preview-img').src
        }
    }

    const notes = document.getElementById('patient-form-mh').value;

    const [y, m, d] = DOB.split('-');
    date = [m, d, y].join('/');

    if (formType == "Update") {
        updatePatient(pId, first, last, DOB, gender, email, phone, address, img, room, notes).then(ret => {
            if (ret.error) {
                console.log('an error has occured');
                document.getElementById('form-error').style.display = "flex";
            } else {
                window.location=`patient.php?id=${pId}`;
            }
            return;
        })
    } else {
        // redirect to newly inserted patient's page
        insertPatient(first, last, DOB, gender, email, phone, address, img, room, notes).then(ret => {
            if (ret.error) {
                console.log('an error has occured');
                document.getElementById('form-error').style.display = "flex";
            } else {
                window.location=`patient.php?id=${ret[0].PatientID}`;
            }
        })
    }
}

// FROM: onchange of patientForm.php
const validateName = (loc, value) => {
    value = value.trim();
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!value.match(nameRegex)) {
        let nameType = "First";
        if (loc == "lName") {
            nameType = "Last";
        }
        const errMsg = `${nameType} name should contain only letters, apostrophes, spaces and hyphens`
        setFieldError(loc, errMsg);
        return false;
    }
    setFieldValid(loc);
    return true;
}

// FROM: onchange of patientForm.php
const validateDOB = (value) => {
    if (!value) {
        const errMsg = "Invalid DOB";
        setFieldError('DOB', errMsg);
        return false;
    }
    setFieldValid('DOB');
    return true;
}

// FROM: onchange of patientForm.php
const validateGender = (value) => {
    if (!value) {
        const errMsg = "Gender is required";
        setFieldError('gender', errMsg);
        return false;
    }
    setFieldValid('gender');
    return true;
}

// FROM: onchange of patientForm.php
const validateAddress = (value) => {
    value = value.trim()
    const addressRegex = /^[a-zA-Z0-9\s,.'-]{3,}$/;
    if (!value.match(addressRegex)) {
        const errMsg = "Email Address is Invalid";
        setFieldError('address', errMsg);
        return false;
    }
    setFieldValid('address');
    return true;
}

// FROM: onchange of patientForm.php
const validatePhone = (value) => {
    value = value.trim()
    const phoneRegex = /^[0-9]+$/;
    if (!value.match(phoneRegex)) {
        const errMsg = "Phone number is Invalid";
        setFieldError('phone', errMsg);
        return false;
    }
    setFieldValid('phone');
    return true;
}

// FROM: onchange of patientForm.php
const validateEmail = (value) => {
    value = value.trim()
    const emailRegex = /^(\w|\-|\.)+\@([a-zA-Z0-9]|\.|-)+\.([a-zA-Z]{2,4}$)/;
    if (!value.match(emailRegex)) {
        const errMsg = "Email address is invalid";
        setFieldError('email', errMsg);
        return false;
    }
    setFieldValid('email');
    return true;
}

// FROM: onchange of patientForm.php
const validateRoom = (value) => {
    if (!value || value < 100 || value > 600) {
        const errMsg = "Invalid room number";
        setFieldError('room', errMsg);
        return false;
    }
    setFieldValid('room');
    return true;
}

// FROM: onchange of patientForm.php
// display choosen image
const previewImg = () => {
    const imgInput = document.getElementById('patient-form-img').files[0];
    fileToDataUrl(imgInput).then(ret => {
        document.getElementById('preview-img').src = ret;
    });
}

// FROM: onclick of patientForm.php
// remove profile image
const clearProfileImg = () => {
    document.getElementById('patient-form-img').value = null;
    document.getElementById('preview-img').src ="#"
}

// FROM: onclick of inventory.php
// toggle inventory list view
const changeIList = (view) => {
    const tabs = document.getElementsByClassName('inven-tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('iActive');
    }

    view.classList.add('iActive');
    loadInventoryList();
}

// FROM: onload and onchange of inventory.php
// loads inventory list
const loadInventoryList = () => {
    const roundType = document.getElementsByClassName('iActive')[0].innerText;
    const date = document.getElementById('iDate').value;
    getInventoryList(roundType, date).then(ret => {
        displayInventoryList(roundType, ret);
    });
}

/******************************************************************************************************************************
                        FUNCTIONS
 ******************************************************************************************************************************/
/***************************************************************
                        FUNCTIONS FOR PATIENTFORM.PHP
***************************************************************/
// show register input is valid
const setFieldValid = (loc) => {
    document.getElementById(`${loc}-error`).style.display = "none";
    document.getElementById(`patient-form-${loc}`).style.border = '1px solid lightseagreen';
}

// show error message of register input
const setFieldError = (loc, errMsg) => {
    document.getElementById(`patient-form-${loc}`).style.border = '1px solid red';
    const errElem = document.getElementById(`${loc}-error`);
    errElem.innerText = errMsg;
    errElem.style.display = 'block';
}

// check new round inputs before inserting
const verifyNewRoundInputs = (patId, pracId) => {
    const roundType = document.getElementById('patient-round-type').value;
    const roundNameId = document.getElementById('select-round-name').value;
    const date = document.getElementById('select-round-date').value;
    const time = document.getElementById('patient-round-time').value;
    const status = document.getElementById('patient-round-status').value;
    const comment = document.getElementById('patient-round-comment').innerText;

    if (roundType.startsWith("Select") || roundNameId.startsWith("Select") || status.startsWith("Select") || !date || !time) {
        document.getElementById('addRound-error').innerText = 'One or more fields is empty';
        document.getElementById('addRound-error').style.display = "block";
        return;
    }

    insertRound(roundType, patId, pracId, roundNameId, date, time, comment, status).then(data => {
        if (data.error) {
            document.getElementById('addRound-error').innerText = 'Error: Insert Failed';
            document.getElementById('addRound-error').style.display = "block";
        } else {
            closeRound();
            const curRegime = document.getElementById('regime-toggle').getAttribute('toggle');
            const center = getCurCenterDateString();
            loadRegimeAll(curRegime, patId, center)
        }
    })

    return;
}

// inserts patient information into form fields for updating patient
const insertFormValues = (pId) => {
    getPatientInfo(pId).then(data => {
        document.getElementById('patient-form-fName').value = data[0].FirstName;
        document.getElementById('patient-form-lName').value = data[0].LastName;
        document.getElementById('patient-form-DOB').value = data[0].DOB.split(' ')[0];
        document.getElementById('patient-form-email').value = data[0].Email;
        document.getElementById('patient-form-phone').value = data[0].Phone;
        document.getElementById('patient-form-address').value = data[0].Address;
        document.getElementById('patient-form-room').value = data[0].Room;

        const genderOpt = document.getElementsByName('gender');
        for (let i = 0; i < genderOpt.length; i++) {
            if (genderOpt[i].value == data[0].Sex) {
                genderOpt[i].checked = true;
            }
        }

        document.getElementById('patient-form-mh').value = data[0].MedicalHistory;

        document.getElementById('preview-img').src = data[0].Photo;
    });
}

/***************************************************************
                        FUNCTIONS FOR PATIENT.PHP
***************************************************************/
// set editable round details to uneditable
const roundDetailsUneditable = () => {
    const status = document.getElementById('patient-round-status');
    status.disabled = true;
    status.style.border = '1px solid black';
    const time = document.getElementById('patient-round-time');
    time.disabled = true;
    time.style.border = '1px solid black';
    const comment = document.getElementById('patient-round-comment');
    comment.setAttribute('contenteditable', false);
    comment.style.border = '1px solid black';
    document.getElementById('round-save-btn').style.display = 'none';
    document.getElementById('round-cancel-btn').style.display = 'none';
    document.getElementById('round-delete-btn').style.display = 'none';
}

// set up display for adding rounds
const setUpRoundAdd = (prac) =>{
    document.getElementById('addRound-error').style.display = "none";
    hideShowRoundElems('addRound');
    document.getElementById('patient-round-container').removeAttribute('data-type');
    document.getElementById('patient-round-container').removeAttribute('data-id');
    const roundType = document.getElementById('patient-round-type')
    roundType.value = "Select Round Type";
    roundType.disabled = false;

    const roundName = document.getElementById('select-round-name');
    roundName.value = "Select Round Name";
    roundName.disabled = false;
    document.getElementById('patient-round-description').innerText = "";

    document.getElementById('patient-med-extra').style.display = "none";

    document.getElementById('select-round-date').value = ""

    const time = document.getElementById('patient-round-time');
    time.value = "";
    time.disabled = false;

    const status = document.getElementById('patient-round-status');
    status.value = "Select Status";
    status.disabled = false;

    const comment = document.getElementById('patient-round-comment')
    comment.innerText = "";
    comment.setAttribute('contenteditable', true);

    document.getElementById('patient-round-practitioner').innerText = prac;

    document.getElementById('round-add-btn').style.display = 'block';
    document.getElementById('round-cancel-btn').style.display = 'block';
    document.getElementById('round-delete-btn').style.display = 'none';

    document.getElementById('patient-round-container').style.display = 'flex';
}

// set options based on round type selected
const setNameOpts = () => {
    const roundType = document.getElementById('patient-round-type').value;
    document.getElementById('patient-round-description').innerText = "";
    removeClones('select-round-name', 1);
    document.getElementById('patient-med-extra').style.display = "none";
    getOptions(roundType).then(data => {
        const selector = document.getElementById('select-round-name');
        for (let i = 0; i < data.length; i++) {
            let opt = document.createElement('option');
            opt.value = data[i][`${roundType}ID`]
            opt.innerText = data[i][`${roundType}Name`];
            if (roundType == "Medication") {
                opt.innerText += ` (${data[i].Dosage})`
            }
            selector.appendChild(opt);
        }

    })
}

// change visual display of regime buttons
const shiftToggle = (regime) => {
    document.getElementById('regime-opt-md').style.backgroundColor = "";
    document.getElementById('regime-opt-d').style.backgroundColor = "";

    document.getElementById('regime-toggle').setAttribute("toggle", regime);
    document.getElementById(`regime-opt-${regime}`).style.backgroundColor = "white";
}

// set description of selected round name
const setDescriptionOpts = () => {
    const roundType = document.getElementById('patient-round-type').value;
    const roundNameId = document.getElementById('select-round-name').value;
    getOptionInfo(roundType, roundNameId).then(data => {
        document.getElementById('patient-round-description').innerText = data[0].Description;
        if (roundType == 'Medication') {
            document.getElementById('patient-med-extra').style.display = "block";
            document.getElementById('patient-admin-method').innerText = data[0].AdministrationMethod;
            document.getElementById('patient-dosage').innerText = data[0].Dosage;
        }
    })
}

// hide elements for adding rounds
const hideShowRoundElems = (method) => {
    let addDisp = "none";
    let showDisp = "none";

    if (method == 'addRound') {
        addDisp = "flex";
    } else {
        showDisp = "flex";
    }

    const roundAdd = document.getElementsByClassName('patient-round-new');
    const roundShow = document.getElementsByClassName('patient-round-show');

    for (let i = 0; i < roundAdd.length; i++) {
        roundAdd[i].style.display = addDisp;
        roundShow[i].style.display = showDisp;
    }

}

// set round details
const setRoundInfo = (data, regimeName, roundID) => {
    hideShowRoundElems('showRound');
    const roundType = document.getElementById('patient-round-type')
    roundType.value = regimeName;
    roundType.disabled = true;
    const roundName = document.getElementById('patient-round-name')
    roundName.innerText = data[`${regimeName}Name`];
    roundName.disabled = true;
    document.getElementById('patient-round-description').innerText = data.Description;

    let date = new Date(data.Date);
    let dateFormat = (date.toDateString()).slice(4);
    document.getElementById('patient-round-date').innerText = dateFormat;

    let time = data.Time.split(' ')[1].slice(0,5);
    document.getElementById('patient-round-time').value = time;
    document.getElementById('patient-round-status').value = data.Status;

    if (regimeName == "Medication") {
        document.getElementById('patient-med-extra').style.display = "block";
        document.getElementById('patient-dosage').innerText = data.Dosage;
        document.getElementById('patient-admin-method').innerText = data.AdministrationMethod;
    } else {
        document.getElementById('patient-med-extra').style.display = "none";
    }

    document.getElementById('round-edit-btn').style.display = "none";
    document.getElementById('round-notify-btn').style.display = "none";

    const comBox = document.getElementById('patient-round-comment')
    let comment = data.Comment;
    comBox.innerText = comment;

    document.getElementById('patient-round-practitioner').innerText = `${data.firstName} ${data.lastName}`;

    verifyEditable(data.firstName, data.lastName).then(ret => {
        if (ret.result) {
            document.getElementById('round-edit-btn').style.display = "block";
            if (data.Status == "Refused" || data.Status == "Missed") {
                document.getElementById('round-notify-btn').style.display = "block";
            } else {
                document.getElementById('round-notify-btn').style.display = "none";
            }
        } else {
            document.getElementById('round-edit-btn').style.display = "none";
        }
    })
    
    document.getElementById('patient-round-container').setAttribute('data-type', convertIdAndFull(regimeName, 'long'));
    document.getElementById('patient-round-container').setAttribute('data-id', roundID);

    document.getElementById('patient-round-container').style.display = 'flex';
}

// send email
const sendEmail = () => {

    let roundType = document.getElementById('patient-round-container').getAttribute('data-type');
    roundType = convertIdAndFull(roundType, 'short')
    const roundId = document.getElementById('patient-round-container').getAttribute('data-id');

    const pName = document.getElementById('patient-name').innerText;

    getRound(roundType, roundId).then(data => {
        const emailTo = "requestfourmango@gmail.com";
        const emailSub = "Round Information";
        const emailBody = `Patient: ${pName} (${data[0].PatientID})\nPractitioner: ${data[0].firstName} ${data[0].lastName} (${data[0].PractitionerID})\nRound Type: ${roundType}\nRound Name: ${data[0][`${roundType}Name`]}\nDate/Time: ${data[0].DateTime}\nStatus: ${data[0].Status}\nComment: ${data[0].Comment}`
    
        location.href = `mailto:${emailTo}?subject=${emailSub}&body=${emailBody}`
    })
}

/***************************************************************
                FUNCTIONS FOR PATIENTLIST.PHP
***************************************************************/
const removeListAttribute = (elem) => {
    elem.removeAttribute('title')
    elem.removeAttribute('onclick')
    elem.classList.remove('sortable-row');
}

// display patient list
const displayPatientList = (patient) => {
    // clear all listed
    let container = document.getElementById('patient-list-container');
    container.innerHTML = "";

    for (let i = 0; i < patient.length; i++) {
        let patientRow = document.getElementById('patientList-card-pat-template').cloneNode(true);
        patientRow.classList.remove('patientList-head');
        patientRow.removeAttribute('id');

        const pId = patientRow.children[0];
        removeListAttribute(pId);
        const last = patientRow.children[1];
        removeListAttribute(last);
        const first = patientRow.children[2];
        removeListAttribute(first);
        const gender = patientRow.children[3];
        const DOB = patientRow.children[4];
        const email = patientRow.children[5].children[0];
        const phone = patientRow.children[5].children[1];

        pId.innerText = patient[i].PatientID;
        last.innerText = patient[i].LastName;
        first.innerText = patient[i].FirstName;
        gender.innerText = patient[i].Sex;
        DOB.innerText = (patient[i].DOB).split(" ")[0];
        email.innerText = patient[i].Email;
        phone.innerText = patient[i].Phone;

        patientRow.onclick = function () {
            window.location=`patient.php?id=${patient[i].PatientID}`;
        }

        container.append(patientRow);
    }
}

// determines which filters are shown based on current list view
const filtersOptions = (view) => {
    const allFilters = document.getElementsByClassName('view-filter');
    for (let i = 1; i < allFilters.length; i++) {
        allFilters[i].style.display = "none";
    }
    const legend = document.getElementById('pList-legend');
    legend.style.display = "none";

    // document.getElementById('patient-filter').style.display = "block";
    if (view == "Round") {
        legend.style.display = "flex";
        const roundFilters = document.getElementsByClassName('round-filter');
        for (let i = 0; i < roundFilters.length; i++) {
            roundFilters[i].style.display = "flex";
        }
    }
}

// reset filter vals
const resetFilterVals = () => {
    const inputFields = document.getElementsByClassName('vf-input');
    for (let i = 0; i < inputFields.length; i++) {
        inputFields[i].value = '';
    }

    const inputSelects = document.getElementsByClassName('vf-select');
    for (let i = 0; i < inputSelects.length; i++) {
        inputSelects[i].selectedIndex = 0;
    }
}

// load patients list
const loadListPatient = (limit, orderField, direction, searchCat, searchVal) => {
    getPatientList(limit, orderField, direction, searchCat, searchVal).then(data => {
        displayPatientList(data);
    })
}

// load patient list for regime
const loadListRound = (limit) => {
    const [field, values] = getFilterParams();

    getRoundList(limit, values[0], values[1], values[2], values[3], values[4], values[5], values[6]).then(data => {
        displayPatientRoundList(data);
    })
}

// display patients list for regime view
const displayPatientRoundList = (patient) => {
    // clear all listed
    let container = document.getElementById('patient-list-container');
    container.innerHTML = "";

    for (let i = 0; i < patient.length; i++) {
        let patientRow = document.getElementById('patientList-card-round-template').cloneNode(true);
        patientRow.classList.remove('patientList-head');
        patientRow.removeAttribute('id');

        const pId = patientRow.children[0];
        const name = patientRow.children[1];
        const roundType = patientRow.children[2];
        const rn = patientRow.children[3];
        const dt = patientRow.children[4];
        const status = patientRow.children[5];
        const prac = patientRow.children[6];

        pId.innerText = patient[i].PatientID;
        name.innerText = `${patient[i].PatientFName} ${patient[i].PatientLName}`
        roundType.innerText = patient[i].RoundType;
        rn.innerText = patient[i].RoundName;
        dt.innerText = formatDateTime(patient[i].Date, patient[i].Time);
        status.innerHTML = `<img class="status-img" src="../assets/status-${determineStatusImg(patient[i].Status)}.png">`;
        prac.innerText = `${patient[i].PractitionerFName} ${patient[i].PractitionerLName}`      

        const rt = convertIdAndFull(patient[i].RoundType, 'long');
        
        patientRow.onclick = function () {
            window.location=`patient.php?id=${patient[i].PatientID}&r=${rt}-${patient[i].RoundID}`;
        }

        container.append(patientRow);
    }
}

// display inventory list
const displayInventoryList = (roundType, data) => {
    removeClones('inventory-list-container', 1);
    const container = document.getElementById('inventory-list-container');
    for (let i = 0; i < data.length; i++) {
        const row = document.getElementById('inventory-list-row-header').cloneNode(true);
        row.removeAttribute('id');

        const roundName = row.children[0];
        const description = row.children[1];
        const total = row.children[2];

        roundName.innerText = data[i][`${roundType}Name`];
        description.innerHTML = data[i].Description;
        total.innerText = data[i].total;
        if (roundType == "Medication") {
            roundName.innerText += `\n(${data[i].Dosage})`;
            description.innerHTML += `<div class="iAM">Administration Method: ${data[i].AdministrationMethod}</div>`;
        }

        container.append(row);
    }
}

/***************************************************************
                        FUNCTIONS FOR PATIENT.PHP
***************************************************************/

// display patient information in profile
const displayPatientInformation = (patient) => {
    document.getElementById('patient-name').innerText = patient.FirstName + ' ' + patient.LastName;
    document.getElementById('patient-Id').innerText = patient.PatientID;
    document.getElementById('patient-room').innerText = patient.Room;
    document.getElementById('patient-sex').innerText = patient.Sex;
    document.getElementById('patient-DOB').innerText = (patient.DOB).split(" ")[0];
    if (patient.Photo) {
        document.getElementById('patient-img').src = patient.Photo;
    }
    document.getElementById('patient-email').innerText = patient.Email;
    document.getElementById('patient-phone').innerText = patient.Phone;
    document.getElementById('patient-address').innerText = patient.Address;
    document.getElementById('patient-notes-box').innerText = patient.MedicalHistory;
}

// load all table data, including dates
const loadRegimeAll = (regime, pId, center) => {
    // clears table
    removeClones('table-container', 1);

    let [d1, d2] = getDateRange(center);
    let d1Copy = new Date(d1);
    setDates(d1Copy);

    loadRegime(regime, pId, d1, d2)
}

// load the table data
const loadRegime = (regime, pId, d1, d2) => {
    // determine tables to show
    const tableList = regime == 'md' ? ['md'] : ['m', 'e'];
    
    for (let i = 0; i < tableList.length; i++) {
        let d2Copy = new Date(d2);
        getRegime(pId, d1, d2Copy, tableList[i]).then(data => {
            // set data
            setTableTitle(tableList[i]);
            setTableData(data, tableList[i]);
        })
    }
}

// set table dates
const setDates = (date) => {
    const row = newRow('table-dates');
    date.setDate(date.getDate() - 1);

    for (let i = 0; i < 7; i++) {
        date.setDate(date.getDate() + 1);
        
        let dateID = date.getDate().toString().padStart(2, 0);
        let monthID = (date.getMonth() + 1).toString().padStart(2, 0);
        let yearID = date.getFullYear();
        let dateElemID = `${dateID}${monthID}${yearID}`;
        
        const col = document.getElementById('table-col-template').cloneNode(true);
        // table display date
        col.innerText = date.toDateString();
        // table set cell id
        col.setAttribute('id', dateElemID);
        row.append(col);
    }
}

// set table title
const setTableTitle = (regime) => {
    const row = newRow(`${regime}-table-title`);
    row.classList.add('table-title');
    row.setAttribute('toggle', true);
    const tableTitle = convertIdAndFull(regime, 'short');
    row.innerText = tableTitle;

    row.onclick = function () {
        toggleTableView(this , regime);
    }
}

// toggle table view
const toggleTableView = (elem, regime) => {
    let toggle = elem.getAttribute('toggle');
    let rows = document.getElementsByClassName(`row-${regime}`);
    let disp = "none";
    if (toggle == 'false') {
        disp = "flex";
        elem.setAttribute('toggle', true)
    } else {
        elem.setAttribute('toggle', false)
    }

    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = disp;
    }
}

// creates and append a new row to the table and sets its id
const newRow = (rowID) => {
    const tableContainer = document.getElementById('table-container');
    const row = document.getElementById('table-row-template').cloneNode(true);
    row.setAttribute('id', rowID);

    tableContainer.append(row);

    const newRow = document.getElementById(rowID);
    return newRow;
}

// set table data
const setTableData = (data, tableName) => {
    const convertedName = convertIdAndFull(tableName, 'short');
    const IDName = `${convertedName}ID`;
    const roundName = `${convertedName}RoundID`;
    
    for (let i = 0; i < data.length; i++) {
        let rowID = `${tableName}-${data[i][IDName]}`;
        let row = document.getElementById(rowID);

        if (!row) {
            const infoName = data[i][`${convertedName}Name`];
            const info2 = tableName == 'md' ? data[i].Dosage : '';

            createNewDataRow(rowID, tableName, infoName, info2);
        }

        let date = data[i].Date.split(' ')[0].split('-'); 
        let elemId = `${rowID}-${date[2]+date[1]+date[0]}`
        let time = data[i].Time.split(' ')[1].slice(0,5);

        addCellData(elemId, tableName, data[i][roundName], data[i].Status, time);
    }

}

// add new row based on medication/meal/exercise/beauty ID
const createNewDataRow = (rowID, regime, infoName, info2) => {
    const row = newRow(rowID);
    row.classList.add(`row-${regime}`);
    row.classList.add('row-round');

    const rowName = `${rowID}-name`;
    row.children[0].setAttribute('id', rowName);

    // set column ids
    const tableDates = document.getElementById('table-dates');
    
    for (let i = 0; i < tableDates.childElementCount - 1; i++) {
        const col = document.getElementById('table-col-template').cloneNode(false);
        const dateID = tableDates.children[i+1].getAttribute('id');
        col.setAttribute('id', `${rowID}-${dateID}`);
        row.append(col);
    }

    addCellData(rowName, regime, 'name', infoName, info2);
}

// add information to table cell
const addCellData = (elemId, regime, roundId, info1, info2) => {    
    const cell = document.getElementById(elemId);
    const cellData = document.getElementById('table-data-template').cloneNode(true);
    cellData.setAttribute('id', `${regime}-${roundId}`);

    if (roundId == 'name') {
        cellData.children[0].innerText = info1;
        cellData.style.flexDirection = "column";
    } else {
        cellData.children[0].children[0].src = `../assets/status-${determineStatusImg(info1)}.png`;
        cellData.classList.add('info-data');
    }
    cellData.children[1].innerText = info2;

    cell.append(cellData);

    if (roundId == 'name') {
        return;
    }

    cellData.onclick = function () {
        roundInfo(`${regime}-${roundId}`);
    }
}

// update cell data after editing round details
const updateCellData = (tableType, roundID, status, time) => {
    const data = document.getElementById(`${tableType}-${roundID}`);
    // cell data not in table view
    if (data == null) {
        return;
    }
    data.children[0].children[0].src = `../assets/status-${determineStatusImg(status)}.png`;
    data.children[1].innerText = time;
}

/***************************************************************
                       API CALLS
***************************************************************/
// fetch data from database
const apiCall = (body) => {
    return new Promise((resolve, reject) => {
        const init = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }

        fetch('../fetchCalls.php', init)
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            // .catch((error) => {
            //     console.log('something went wrong :(\n' ,error);
            // })
    })
}

// login
const practitionerLogin = (username, password) => {
    return apiCall({
        action: 'login',
        username,
        password
    })
}

// logout
const practitionerLogout = () => {
    return apiCall({
        action: 'logout',
    })
}

// get list of patients
const getPatientList = (limit, orderBy, direction, searchCat, searchVal) => {
    return apiCall({
        action: 'getPatientList',
        limit,
        orderBy,
        direction,
        searchCat,
        searchVal
    })
}

// get patient info by patient id
const getPatientInfo = (patientId) => {
    return apiCall({
        action: 'getPatientInfo',
        patientId
    });
}

// get regime between dates
const getRegime = (patientId, date1, date2, regimeSF) => {
    const tableName = convertIdAndFull(regimeSF, 'short');

    date2.setDate(date2.getDate() + 1);

    let d1 = dateToString(date1);
    let d2 = dateToString(date2);

    return apiCall({
        action: 'getRegime',
        patientId,
        tableName,
        d1,
        d2
    })
}

// get round information by ID
const getRound = (tableName, roundId) => {
    return apiCall({
        action: 'getRound',
        tableName,
        roundId
    })
}

// update round information
const updateRound = (tableName, roundId, status, time, comment) => {
    return apiCall({
        action: 'updateRound',
        tableName,
        roundId,
        status,
        time,
        comment
    })
}

// get options by round type
const getOptions = (tableName) => {
    return apiCall({
        action: 'getOptions',
        tableName
    })
}

// get information by round type and id
const getOptionInfo = (tableName, roundNameId) =>{
    return apiCall({
        action: 'getOptionInfo',
        tableName,
        roundNameId
    })
}

// insert round
const insertRound = (tableName, patientId, practitionerId, roundNameId, date, time, comment, status) => {
    const [y, m, d] = date.split('-');
    const dateFormatted = [m, d, y].join('/');
    const dateTime = dateFormatted + " " + time;

    return apiCall({
        action: 'insertRound',
        tableName,
        patientId,
        practitionerId,
        roundNameId,
        date,
        time,
        dateTime,
        comment,
        status
    })
}

const deleteRound = (tableName, roundId) => {
    return apiCall({
        action: 'deleteRound',
        tableName,
        roundId
    })
}

// insert patient
const insertPatient = (first, last, DOB, gender, email, phone, address, img, room, notes) => {
    return apiCall({
        action: 'insertPatient',
        first,
        last,
        DOB,
        gender,
        email,
        phone,
        address,
        img,
        room,
        notes
    })
}

// update patient information
const updatePatient = (pId, first, last, DOB, gender, email, phone, address, img, room, notes) => {
    return apiCall({
        action: 'updatePatient',
        pId,
        first,
        last,
        DOB,
        gender,
        email,
        phone,
        address,
        img,
        room,
        notes
    })
}

// verify practitioner accessing is practitioner who created
const verifyEditable = (first, last) => {
    return apiCall({
        action: 'verifyEditable',
        first,
        last
    })
}

const getRoundList = (limit, patient, practitioner, dateStart, dateEnd, type, name, status) => {
    return apiCall({
        action: 'getRoundList',
        limit,
        dateStart,
        dateEnd,
        type,
        name,
        status,
        practitioner,
        patient
    })
}

const getInventoryList = (roundType, date) => {
    return apiCall({
        action: 'getInventoryList',
        roundType,
        date
    })
}

/***************************************************************
                        HELPER FUNCTIONS
***************************************************************/
// determine if searched value is an id or name
const nameOrId = (input) => {
    let searchCat = 'ID';
    if (isNaN(input)) {
        searchCat = 'Name';
    }

    return searchCat;
}

// return filter params
const getFilterParams = () => {
    const view = document.getElementsByClassName('view-active')[0].id.split('-')[2];
    let filterField = [];
    let filterValue = [];

    const patient = document.getElementById('patient-search-input')
    filterField.push(`patient${nameOrId(patient.value)}`);
    filterValue.push(patient.value)

    if (view == "round") {
        filterField.push(...['practitioner', 'dateStart', 'dateEnd', 'roundType', 'roundName', 'status'])
        
        const roundFilters = document.getElementsByClassName('rf-i');
        for (let i = 0; i < roundFilters.length; i++) {
            filterValue.push(roundFilters[i].value);
        }
    }

    return [filterField, filterValue];
}

// determine sorting direction
const determineOrderDirection = (direction) => {
    let newDirection = 'ASC';
    let newTitle = 'Ascending';
    if (direction == "Ascending") {
        newDirection = 'DESC';
        newTitle = 'Descending';
    }

    return [newDirection, newTitle];
}

// revert row sorting to default ascending order
const sortingRowDefault = () => {
    const sortableRows = document.getElementsByClassName('sortable-row');
    for (let i = 0; i < sortableRows.length; i++) {
        sortableRows[i].setAttribute('title', 'Sort Ascending');
        sortableRows[i].children[0].innerHTML = '&nbsp;&#9650;'
    }
}

// set active sorting field and direction
const setActiveSortingField = (elem) => {
    const sortableRows = document.getElementsByClassName('sortable-row');
    for (let i = 0; i < sortableRows.length; i++) {
        sortableRows[i].classList.remove('active-sort')
    }
    elem.classList.add('active-sort');
}

// returns the currently active sorting field and direction
const getActiveSortingField = () => {
    const sortingActive = document.getElementsByClassName('active-sort')[0];
    const field = sortingActive.id.split('-')[1];
    const direction = sortingActive.title.split(' ')[1] == 'Descending' ? 'DESC' : 'ASC';
    return [field, direction];
}

// determine status image colour based on round status
const determineStatusImg = (status) => {
    let colour;
    if (status == 'Given' || status == 'Completed') {
        colour = 'green';
    } else if (status == "Future") {
        colour = 'blue';
    } else {
        colour = 'red';
    }

    return colour;
}

// return current center date in view
const getCurCenterDateString = () => {
    const tableHead = document.getElementById('table-dates');
    let curCenter = tableHead.children[4].id;

    let date = curCenter.slice(0,2);
    let month = curCenter.slice(2,4);
    let year = curCenter.slice(4,8);
    let formatDate = `${month}/${date}/${year}`;

    return formatDate
}

// returns 1 week view based on a center date
const getDateRange = (center) => {
    // min date
    let d1 = new Date(center);
    d1.setDate(d1.getDate() - 3);
    // max date
    let d2 = new Date(center);
    d2.setDate(d2.getDate() + 3);

    return [d1, d2];
}

// convert abbreviated string forms to full string forms (and vice versa)
const convertIdAndFull = (input, type) => {
    const conversionDict = {
        md: 'Medication',
        e: 'Exercise',
        m: 'Meal',
        d: 'Diet'
    }

    // returns short form
    if (type == 'long') {
        return Object.keys(conversionDict).find(key => conversionDict[key] === input)
    }    

    // returns full string form
    return conversionDict[input];
}

// remove clones at location (except template divs)
const removeClones = (locationId, length) => {
    const location = document.getElementById(locationId);
    while(location.children.length > length) {
        location.removeChild(location.lastChild);
    }
}

// image file to url
const fileToDataUrl = (file) => {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        console.log('provided file is not a png, jpg or jpeg image.');
    }
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

/***************************************************************
                       FORMATTING HELPERS
***************************************************************/
// convert date object to string (mm/dd/yyyy)
const dateToString = (date) => {
    let d = date.getDate();
    let m = date.getMonth() + 1;
    let y = date.getFullYear();
    let formattedDate = [y, m, d].join('-');

    return formattedDate;
}

// formating time display for rounds list view
const formatDateTime = (date, time) => {
    let y = date.split(' ')[0].slice(0, 4);
    let m = date.split(' ')[0].slice(5, 7);
    let d = date.split(' ')[0].slice(8, 10);
    let t = time.split(' ')[1].slice(0,5)
    return `${d}/${m}/${y}` + '\n' + t;
}
