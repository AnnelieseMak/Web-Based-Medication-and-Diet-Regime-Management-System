<?php
    $pId = isset($_GET['id']) ? $_GET['id'] : "";
    $buttonText = isset($_GET['id']) ? "Update" : "Register";
?>

<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../styles/styles.css">
        <link rel="stylesheet" href="../styles/inventoryStyles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="../main.js" type="text/javascript"></script>
        <title>BS Health Portal</title>
    </head>
    <body id="inventory-page" class="page" onload="loadInventoryList()">
        <!-- NAV BAR -->
        <?php require_once('../components/nav.php')?>
        <!-- DASHBOARD CONTENTS -->
        <div id="inventory-content-container" class="page-content-container">
            <h1 class="page-heading">INVENTORY</h1>
            <div class="card-design" id="i-tabs">
                <div id="list-toggle">
                    <div class="inven-tab iActive" onclick="changeIList(this)">Medication</div>
                    <div class="inven-tab" onclick="changeIList(this)">Meal</div>
                    <div class="inven-tab" onclick="changeIList(this)">Exercise</div>
                </div>
            </div>
            <div id="i-date-box">
                    By date:
                    <input onchange="loadInventoryList()" id="iDate" type="date"/>
                </div>
            <div id="inventory-list-container" class="card-design">
                <div class="inventory-list-row" id="inventory-list-row-header">
                    <div>Round Name</div>
                    <div class="c-Description">Description</div>
                    <div>Total</div>
                </div>
            </div>
        </div>
    </body>
</html>