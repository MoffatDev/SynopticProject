window.onload = init; // Intialize Map upon Window Load.

const HOTSPOTS = [[]];
var mapObj = "";

function init() { // Initialization Function.

    // Map Object.
    var map = new ol.Map({  // Calling new Map Instance from OpenLayers (OL) Library.
        view: new ol.View({  // Creating the View. 
            center: [ -9046524.067 , -505585.593 ] ,   // Piedritas Coords.
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
    })

    map.addLayer(layers);  // Add Layer Group to Map.
    mapObj = map;

    // -- Layer View Switching Logic -- 

    // Field for all Avaliable Layers on Webpage.
    const selectLayers = document.querySelectorAll('.sidebar > input[type=radio]');

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

    map.on('click' , function(e) {

        checkPoint(e.coordinate);
        popUp(e.coordinate);

    })

    document.getElementById("default").click();

    HOTSPOTS[0] = { LONG: -9047833 , LAT: -496186 , NAME: "Title" , EL: true , WA: true };
    HOTSPOTS[1] = { LONG: -9048614 , LAT: -496642 , NAME: "Church" , EL: true , WA: false};
    HOTSPOTS[3] = { LONG: -9048277 , LAT: -496398 , NAME: "La Casona" , EL: false , WA: true};
    HOTSPOTS[2] = { LONG: 1, LAT: 1, NAME: "Wonderland" , EL: false , WA: true};

    console.log("Known Hotspots: ");

    listPoints();
}

function listPoints() {
    HOTSPOTS.forEach(function(value) {

        console.log(value.LONG + " , " + value.LAT + ": " + value.NAME);

    });
}

function openTask(event , task) {

  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(task).style.display = "block";
  event.currentTarget.className += " active";
}

function reCentreMap(centre) {
    var view = new ol.View({
        center: centre ,   // Lobitos Coords.
        zoom: 17 , // Initial Zoom Level (x14)
        maxZoom: 20 , // Max Zoom Level.
        minZoom: 0 // Min Zoom Level.
    });

    mapObj.setView(view);
}

function popUp(coords , msg) {

    var coor = coords ,
    container = document.getElementById('popup') , 
    content = document.getElementById('popup-content') , 
    closer = document.getElementById('popup-closer') ,
    magn = document.getElementById('popup-magn');

    overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
    });
    mapObj.addOverlay(overlay);

    console.log(coor);

    if (msg == null) {
        msg = "Unknown Location";
    }

    content.innerHTML = '<p>' + msg + '<br>Electricity:' + true + '<br>Water:' + false + '</p>';
    overlay.setPosition(coor);

    magn.onclick = function () {
        reCentreMap(coor);

        overlay.setPosition(undefined);
        closer.blur();
        return false;
    }

    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
}

function checkPoint(coords) {
    // Get Selected Location Values.
    let LONG = Math.round(coords[0]) , LAT = Math.round(coords[1]);
    
    console.log("Selected Location: " + LONG + " , " + LAT + " , Checking for Hotspot");

    toPage("CResult" , "Selected Location: " + LONG + " , " + LAT);
    toPage("AResult" , "Selected Location: " + LONG + " , " + LAT);

    HOTSPOTS.forEach(function(value) {

        if ( ( LONG <= (value.LONG + 10)) && (LONG >= (value.LONG - 10)) && (LAT <= (value.LAT + 10)) && (LAT >= (value.LAT - 10)) ) {

            console.log("Selected Location matches Hotspot: " + value.NAME);

            var txt = "Found Hotspot: " + value.NAME + "<br> Electricty Status: " + value.EL + "<br> Water Status: " + value.WA;

            toPage("CResult" , txt);
            toPage("AResult" , txt);
            popUp([ value.LONG , value.LAT ] , [ value.EL , value.WA ]);
        } 
    });
}

function checkUserPoint(ULAT , ULONG , UNAME) {

    var LAT = ULAT.value , 
    LONG = ULONG.value , 
    NAME = String(UNAME.value) , 
    VALID = true;

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
        console.log(LONG);
        console.log(LAT);
        console.log(NAME);

        for (let i = 0; i < HOTSPOTS.length; i++) {
            if (LONG == HOTSPOTS[i].LONG && LAT == HOTSPOTS[i].LAT) {
                toPage("CResult" , "Hotspot Found with Coords: " + LONG + " , " + LAT);
                popUp( [ HOTSPOTS[i].LONG , HOTSPOTS[i].LAT ] ,  HOTSPOTS[i].LONG + " , " + HOTSPOTS[i].LAT );
                VALID = false;
            } else if (NAME === HOTSPOTS[i].NAME) {
                toPage("CResult" , "Hotspot Found with Name: " + NAME );
                popUp( [ HOTSPOTS[i].LONG , HOTSPOTS[i].LAT ] , NAME);
                VALID = false;
            }

            if (VALID) {
                toPage("CError" , "No Hotspot was Found");
            }
        }
    }
}

function addPoint(ULONG , ULAT , UNAME , UWATER , UEL) {

    var LAT = ULAT.value , 
    LONG = ULONG.value , 
    NAME = String(UNAME.value) , 
    EL = UEL.value , 
    WA = UWATER.value ,
    VALID = true, 
    VERIFY = true;

    /*
    console.log(LONG);
    console.log(LAT);
    console.log(UNAME.value);
    console.log(EL);
    console.log(WA);
    */

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
        console.log(LONG);
        console.log(LAT);
        console.log(UNAME.value);
        console.log(EL);
        console.log(WA);

        for (let i = 0; i < HOTSPOTS.length; i++) {
            if (LONG == HOTSPOTS[i].LONG && LAT == HOTSPOTS[i].LAT) {
                toPage("AError" , "The entered Coords are already registered to a Hotspot.");
                VERIFY = false;
            }

            if (NAME === HOTSPOTS[i].NAME) {
                toPage("AError" , "The entered Name is already registered to a Hotspot");
                VERIFY = false;
            }
        }

        if (VERIFY) {
            toPage("AResult" , "Hotspot Added as " + NAME);
            popUp( [ LONG , LAT] , NAME );
        }
    }
}

function toPage(element , msg) {
    document.getElementById(element).innerHTML = msg;
}