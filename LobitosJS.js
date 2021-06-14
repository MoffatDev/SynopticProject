window.onload = init; // Intialize Map upon Window Load.

const HOTSPOTS = [[]];
var mapObj = "";

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

    // Standard Layer - Map Initally loaded in with.
    const STANDARD = new ol.layer.Tile({ 
        source: new ol.source.OSM() ,  // Source from OL Library.
        visible: true,   // Visibilty to true for inception.
        title: 'OSMStandard'  // Bind to HTML Element.
    })

    // Humanitarain Layer - More detailed Colour Mapping.
    const HUMANITARIAN = new ol.layer.Tile({
        source: new ol.source.OSM({  // Source from external URL.
            url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'  // Retrive as jpg.
        }) , 
        visible: false ,  // Visibilty to false for Inception.
        title: 'OSMHumanitarian' // Bind to HTML Element.
    })

    // HighContrast Layer - Black & White Scheme.
    const HIGHCONSTRAST = new ol.layer.Tile({
        source: new ol.source.XYZ({  // Source from External URL.
            url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png' ,  // Retrive as PNG.
            
            // For this Layer, attributions are necessary.
            attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
        }) , 
        visible: false ,  // Visibilty to false for Inception.
        title: 'HIGHCONTRAST'  // Bind to HTML Element.
    })

    // Group for all Layers. 
    const layers = new ol.layer.Group({
        layers: [
            STANDARD ,
            HUMANITARIAN,
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

function addPoint(ULONG , ULAT, UNAME, UEL , UWATER) {
    var NAME = String(UNAME.value) , LAT = ULAT.value , LONG = ULONG.value , EL = UEL.value , WATER = UWATER.value;

    if (NAME.length > 2 && LONG != null && LAT != null) {
        console.log(LONG , LAT , NAME);

        var coords = { LONG: LONG , LAT: LAT , NAME: NAME , EL: EL , WATER: WATER };

        if (HOTSPOTS.includes(coords)) {
            toPage("Result" , "Coords are already in a present Hotspot. Please try again.");
        } else {
            toPage("Result" , "Hotpsot Added.");
            HOTSPOTS.push(coords);
        }

    } else {
        toPage("Result" , "Please enter all details required.");
    }
}

function checkPoint(coords) {
    // Get Selected Location Values.
    let LONG = Math.round(coords[0]) , LAT = Math.round(coords[1]);
    
    console.log("Selected Location: " + LONG + " , " + LAT + " , Checking for Hotspot");

     HOTSPOTS.forEach(function(value) {

        if ( ( LONG <= (value.LONG + 10)) && (LONG >= (value.LONG - 10)) && (LAT <= (value.LAT + 10)) && (LAT >= (value.LAT - 10)) ) {

            console.log("Selected Location matches Hotspot: " + value.NAME);

            toPage("Result" , "Found Hotspot: " + value.NAME + "<br> Electricty Status: " + value.EL + "<br> Water Status: " + value.WA);

            reCentreMap( [ value.LONG , value.LAT ] );
        }
    });
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

function popUp(coords) {

    var coor = coords ,
    container = document.getElementById('popup') , 
    content = document.getElementById('popup-content') , 
    closer = document.getElementById('popup-closer') ,
    overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
    });

    mapObj.addOverlay(overlay);

    content.innerHTML = '<p>You clicked here:</p>';
    overlay.setPosition(coor);

    console.log(coor);

    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
}



function userPoint(ULONG , ULAT) {
    console.log("User-Entered Coords: " + ULONG.value + " , " + ULAT.value);

    var x = [ULONG.value , ULAT.value];

    checkPoint(x);
}

function toPage(element , msg) {
    document.getElementById(element).innerHTML = msg;
}

