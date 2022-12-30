<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="../styles/styles.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="../main.js" type="text/javascript"></script>
        <title>BS Health Portal</title>
    </head>
    <body id="login-page">
        <div id="login-title">BS Health Portal</div>
        <div class="card-design" id="login-container">
            <div id="login-heading">WELCOME!</div>
            <div id="login-error"> &#9888; Incorrect username or password</div>
            <div id="login-form-container">
                <div id="login-form">
                    <input type="text" id="username-input" name="username-input" placeholder="Username"><br><br>
                    <input type="password" id="password-input" name="password-input" placeholder="Password"><br>
                    <div id="forgot-password">Forgot Password?</div><br><br>
                    <button id="login-button" onclick=login()>Login</button>
                </div>
            </div>
        </div>
    </body>
</html>