function init() {
    let isInternalNavigation = false;
    const anchors = document.querySelectorAll("a[href]"); // listening to any moving around in the page
    anchors.forEach(a => {
        a.addEventListener("click", function (e) {
            // ex1:
            // www.example.com/index.html -> example.com
            // www.example.com/about.html -> example.com
            // if example.com == example.com then dont prevent the action
            // ex2: 
            // www.example.com/index.html -> example.com
            // www.notexample.com/about.html -> notexample.com
            // example.com != notexample.com then prevent the action

            const linkHost = new URL(a.href).host; // If in the same app, prevent it from preventing
            const currentHost = location.host;
            if (linkHost === currentHost) {
                isInternalNavigation = true;
            }
        });
    });

    // Function that prevent the user from leaving the app but not from navigating in the app
    window.addEventListener("beforeunload", function (e) {
        if (!isInternalNavigation) {
            e.preventDefault(); // sending the preventing action 
            e.returnValue = '';
            isInternalNavigation = false; // Reseting
        }
    });

    // Function that will manage any needs after closing the app
    window.addEventListener("unload", function (e) {
        if (!isInternalNavigation) {
            this.document.getElementById("text").style.backgroundColor = "red"; // Highliting text as a test
        }
    });
}




