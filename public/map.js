window.onload = init; // Intialize Map upon Window Load.

const HOTSPOTS = [[]];  // Hotspot Array Obj.
var mapObj = "";  // Global Map Obj;

function init() { // Initialization Function.

    // Map Object.
    var map = new ol.Map({  // Calling new Map Instance from OpenLayers (OL) Library.
        view: new ol.View({  // Creating the View.
            center: [ -9047783.58 , -496188.42] ,   // Lobitos Coords.
            zoom: 15 , // Initial Zoom Level (x14)
            maxZoom: 20 , // Max Zoom Level.
            minZoom: 0 // Min Zoom Level.
        }) ,
        target: 'map'  // Bind to HTML Element.
    });

    // Objects for different Layer Views; Standard , Humanitarian & HighContrast.

    // Simple Layer - Map Initally loaded in with.
    const SIMPLE = new ol.layer.Tile({
        source: new ol.source.OSM() ,  // Source from OL Library.
        visible: true,   // Visibilty to true for inception.
        title: 'Simplistic'  // Bind to HTML Element.
    })

    // Detailed Layer - More detailed Colour Mapping.
    const DETAILED= new ol.layer.Tile({
        source: new ol.source.OSM({  // Source from external URL.
            url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'  // Retrive as jpg.
        }) ,
        visible: false ,  // Visibilty to false for Inception.
        title: 'Detailed' // Bind to HTML Element.
    })

    // HighContrast Layer - Black & White Scheme.
    const HIGHCONSTRAST = new ol.layer.Tile({
        source: new ol.source.XYZ({  // Source from External URL.
            url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png' ,  // Retrive as PNG.

            // For this Layer, attributions are necessary.
            attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
        }) ,
        visible: false ,  // Visibilty to false for Inception.
        title: 'HighContrast'  // Bind to HTML Element.
    })

    // Group for all Layers.
    const layers = new ol.layer.Group({
        layers: [
            SIMPLE ,
            DETAILED ,
            HIGHCONSTRAST
        ]
    });

    map.addLayer(layers);  // Add Layer Group to Map.
    mapObj = map;  // Global Map container assingment.
    console.log(mapObj.getLayers());

    // -- Layer View Switching Logic --

    // Field for all Avaliable Layers on Webpage.
    const selectLayers = document.getElementsByName("selectLayer");

    var buttons = document.getElementsByName("selectLayer");
    buttons[0].checked = true;
    buttons[1].checked = false;
    buttons[2].checked = false;

    // Iterate Through all Layers.
    for (let selectedLayer of selectLayers) {
        selectedLayer.addEventListener('change' , // Listen for Change in state.
        function() {
            let selectedLayerValue = this.value;  // Get Layer Value

            // Iterate through Layer Group
            layers.getLayers().forEach(function(element , index , array) {
                let layerTitle = element.get('title');

                // If Selected Layer is not currently Displayed, set Visibility to True, i.e. Display.
                element.setVisible(layerTitle === selectedLayerValue);
            })
        })
    }

    var sidebarButton = document.getElementById("sidebarButton");
    let sidebarButtonControl = new ol.control.Control({ element: sidebarButton});

    sidebarButtonControl.innerHTML ="⚙";
    mapObj.addControl(sidebarButtonControl);

    map.on('click' , function(e) {  // User Click Function.

        checkPoint(e.coordinate);  // Checks if Point is Hotspot.

    })

    // Hotspot Values.
    HOTSPOTS[0] = { LONG: -9047833 , LAT: -496186 , NAME: "Title" , EL: 1 , WA: 1 };
    HOTSPOTS[1] = { LONG: -9048614 , LAT: -496642 , NAME: "Church" , EL: 2, WA: 4};
    HOTSPOTS[3] = { LONG: -9048277 , LAT: -496398 , NAME: "La Casona" , EL: 4 , WA: 4};
    HOTSPOTS[2] = { LONG: 1, LAT: 1, NAME: "Wonderland" , EL: 2 , WA: 2};

    console.log("Known Hotspots: ");  // Debuging Prompt.

    listPoints();  // List all Hotspots.
}

function listPoints() { // Function to List all registered Hotspots.

    // Iterates through Hotspots , display attributes to Screen.
    HOTSPOTS.forEach(function(value) {

        console.log(value.LONG + " , " + value.LAT + ": " + value.NAME);

    });
}

function toggleSideBar(){
  let sidebar = document.getElementById("sidebar");
  let map = document.getElementById("map");
  if(sidebar.style.width === "250px"){
    sidebar.style.width = "0px";
    map.style.marginLeft = "0px";
    sidebar.style.display = "none";
  }else{
    sidebar.style.width = "250px";
    map.style.marginLeft = "250px";
    sidebar.style.display = "inline";
  }
}

function toggleHotSpotForm(){
  let addSpot = document.getElementById("addSpot");
  let checkSpot = document.getElementById("checkSpot");
  if(addSpot.style.display == "block"){
    addSpot.style.display = "none";
    checkSpot.style.display = "block";
    document.getElementById("toggleHotSpotForm").innerText = "Add hotspot"
  }else{
    addSpot.style.display = "block";
    checkSpot.style.display = "none";
    document.getElementById("toggleHotSpotForm").innerText = "Check hotspot"
  }
}

function openTask(event , task) {  // Function to open relevant Tab.

  // Declare variables for Index , Tab Container & Element Container.
  var i, tabcontent, tablinks;

  // Hide all Feautrues - displayed or not.
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Hide all Elements - displayed or not.
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Display requested Tab , appending suffix 'active' as indicator.
  document.getElementById(task).style.display = "block";
  event.currentTarget.className += " active";
 }

function reCentreMap(centre) {  // Function to Recentre Map at specific Location.
    var view = new ol.View({
        center: centre ,   // Centre Coords.
        zoom: 17 , // Initial Zoom Level (x14)
        maxZoom: 20 , // Max Zoom Level.
        minZoom: 0 // Min Zoom Level.
    });

    mapObj.setView(view); // View assignment.
}

function popUp(coords , WATER , EL, msg) {  // Function to create and Display Popup at selected Location and with optional Message.

    // Variable assignment for Coords , Container for Popup div , Popup Content , Popup Closer & Popup Magnification.

    var coor = coords ,
    container = document.getElementById('popup') ,
    content = document.getElementById('popup-content') ,
    closer = document.getElementById('popup-closer') ,
    magn = document.getElementById('popup-magn');

    // Create new Overlay for Popup on current Map.
    overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
    });
    mapObj.addOverlay(overlay); // Add Overlay to Map.

    console.log(coor); // Debug prompt.

    // Checks if Message is null.
    if (msg == null) {
        msg = "Unknown Location";
    }

    console.log(EL);

    // Assigns Content of Popup.
    content.innerHTML = '<p>' + msg + '<br>Electricity:' + EL + '<br>Water:' + WATER + '</p>';
    overlay.setPosition(coor); // Sets posistion of Overlay.

    // Magnification Function.
    magn.onclick = function () {
        reCentreMap(coor);
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    }

    // Closer Funciton.
    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
    container.style.display = "block";
}

function checkPoint(coords) {  // Function to Check a selected Point from a User Click against registered Hotspots.

    clearMessages();

    // Get Selected Location Values.
    let LONG = Math.round(coords[0]) , LAT = Math.round(coords[1]);

    console.log("Selected Location: " + LONG + " , " + LAT + " , Checking for Hotspot"); // Debug Prompt.

    // Webpage Message.
    toPage("CResult" , "Selected Location: " + LONG + " , " + LAT);
    toPage("AResult" , "Selected Location: " + LONG + " , " + LAT);

    var VERIFY = false;

    // Iterate through Hotspots.
    HOTSPOTS.forEach(function(value) {

        // Checks if selected Coords are within range of any regsitered Hotspots.
        if ( ( LONG <= (value.LONG + 10)) && (LONG >= (value.LONG - 10)) && (LAT <= (value.LAT + 10)) && (LAT >= (value.LAT - 10)) ) {

            console.log("Selected Location matches Hotspot: " + value.NAME);  // Debug Prompt.

            // Message Variable.
            var txt = "Found Hotspot: " + value.NAME + "<br> Electricty Status: " + value.EL + "<br> Water Status: " + value.WA;

            // Webpage Message.
            toPage("CResult" , txt);

            // New Popup at Location.
            popUp([ value.LONG , value.LAT ] , value.WA , value.EL , value.NAME + ": " + value.LONG + " , " + value.LAT);

            VERIFY = true;
        }
    });

    if (!VERIFY) {
        popUp([ LONG , LAT ] , "Unkwnon" , "Unknown");
    }
}

function checkUserPoint(ULAT , ULONG , UNAME) {  // Function to Check a User-Entered Point against registered Hotspots.

    clearMessages();

    // Variables for User-Entered Values.
    var LAT = ULAT.value ,
    LONG = ULONG.value ,
    NAME = String(UNAME.value) ,
    VALID = true;

    // Conditionals to check for missing Values.
    if ( (LAT.length == 0 || LONG.length == 0) && NAME === "") {
        toPage("CError" , "Please enter both Longitude & Latitude Coords");
        VALID = false;
    } else if ((LAT.length == 0 || LONG.length == 0) || NAME !== "") {
        VALID = true;
    }

    if (NAME === "") {
        toPage("CError" , "Please enter a Hotspot Name");
        VALID = false;
    }

    if (VALID) {
        // Debug Prompt.
        console.log(LONG);
        console.log(LAT);
        console.log(NAME);

        // Iteration through all knwon spots.
        for (let i = 0; i < HOTSPOTS.length; i++) {
            if (LONG == HOTSPOTS[i].LONG && LAT == HOTSPOTS[i].LAT) { // Checks for Coords Match
                toPage("CResult" , "Hotspot Found with Coords: " + LONG + " , " + LAT);  // Screen Message
                popUp( [ HOTSPOTS[i].LONG , HOTSPOTS[i].LAT ] ,
                    HOTSPOTS[i].WA , HOTSPOTS[i].EL,
                    HOTSPOTS[i].NAME + ": " + HOTSPOTS[i].LONG + " , " + HOTSPOTS[i].LAT ); // Popup at Location

                VALID = false;
            } else if (NAME === HOTSPOTS[i].NAME) {  // Checks for Name Match
                toPage("CResult" , "Hotspot Found with Name: " + NAME ); // Screen Message.
                popUp( [ HOTSPOTS[i].LONG , HOTSPOTS[i].LAT ] ,
                    HOTSPOTS[i].WA , HOTSPOTS[i].EL,
                    HOTSPOTS[i].NAME + ": " + HOTSPOTS[i].LONG + " , " + HOTSPOTS[i].LAT ); // Popup at Location

                VALID = false;
            }
        }

        if (VALID) {
            toPage("CError" , "No Hotspot was Found"); // Screen Message.
        }
    }
}

function addPoint(ULONG , ULAT , UNAME , UWATER , UEL) {  // Function to add a Hotspot.

    clearMessages();

    // Variables for User-Enetred Values.
    var LAT = ULAT.value ,
    LONG = ULONG.value ,
    NAME = String(UNAME.value) ,
    EL = UEL.value ,
    WA = UWATER.value ,
    VALID = true,
    VERIFY = true;

    // Error Handling.
    if (LONG.length == 0 || LAT.length == 0) {
        toPage("AError" , "Please enter both Longitude & Latitude Coords.");
        VALID = false;
    }

    if (NAME == "") {
        toPage("AError" , "Please enter a Hotspot Name.");
        VALID = false;
    }

    if (EL.length == 0) {
        toPage("AError" , "Please enter an Electricity Level.");
        VALID = false;
    }

    if (WA.length == 0) {
        toPage("AError" , "Please enter a Water Level.");
        VALID = false;
    }

    if (VALID) {
        // Debug Prompt.
        console.log(LONG);
        console.log(LAT);
        console.log(UNAME.value);
        console.log(EL);
        console.log(WA);

        // Iterate thropugh Hotpsots
        for (let i = 0; i < HOTSPOTS.length; i++) {
            if (LONG == HOTSPOTS[i].LONG && LAT == HOTSPOTS[i].LAT) { // Check for Coor Match
                toPage("AError" , "The entered Coords are already registered to a Hotspot."); // Screen Message.
                VERIFY = false;
            }

            if (NAME === HOTSPOTS[i].NAME) {  // Check for Name Match.
                toPage("AError" , "The entered Name is already registered to a Hotspot");  // Screen Message
                VERIFY = false;
            }
        }

        if (VERIFY) {
            toPage("AResult" , "Hotspot Added as " + NAME); // Screen Message.
            popUp( [ LONG , LAT] , WA , EL , NAME ); // Popup.
        }
    }
}

function toPage(element , msg) {  // Function to Print a Message to webpage.
    document.getElementById(element).innerHTML = msg;
}

function clearMessages() {
    document.getElementById("CResult").innerHTML = "";
    document.getElementById("AResult").innerHTML = "";
    document.getElementById("CError").innerHTML = "";
    document.getElementById("AError").innerHTML = "";
}
