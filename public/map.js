window.onload = init; // Intialize Map upon Window Load.
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
}

function recenterOnTown(){
  let town = document.getElementById("centreOnTownSelection").value;
  if(town === "Lobitos"){
    reCentreMap([ -9047783.58 , -496188.42]);
  }else{
    reCentreMap([ -9046524.067 , -505585.593 ]);
  }
}

function toggleSideBar(){
  //Get sidebar and map
  let sidebar = document.getElementById("sidebar");
  let map = document.getElementById("map");
  //If sidebar is already extended, set its width to zero and return map
  //to normal as well, hide sidebar content
  if(sidebar.style.width === "250px"){
    sidebar.style.width = "0px";
    map.style.marginLeft = "0px";
    sidebar.style.display = "none";
  //If sidebar is not already extended, set its width to 250 and add margin to
  //map to move it out the way, show sidebar cotent
  }else{
    sidebar.style.width = "250px";
    map.style.marginLeft = "250px";
    sidebar.style.display = "inline";
  }
}

//Switches between the add and check hotspot form
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

    // Checks if Message is null.
    if (msg == null) {
        msg = "Unknown Location";
    }


    // Assigns Content of Popup.
    let elString = "<br>" + (EL ? "Has": "Doesn't have") + " Electricity";
    let waterString = "<br>" + (WATER ? "Has": "Doesn't have") + " Water";
    content.innerHTML = '<p>' + msg + elString + waterString + '</p>';
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

function checkPoint(coords){
  // Get Selected Location Values.
  let long = Math.round(coords[0]) , lat = Math.round(coords[1]);
  document.getElementById("checkLong").value = long;
  document.getElementById("checkLat").value = lat;
  document.getElementById("checkName").value = "";
  checkSpot();
}


function checkSpot(){
  //close sidebar if it is open
  if(document.getElementById("sidebar").style.display == "inline"){
    toggleSideBar();
  }
  let form = {};
  form.name = document.getElementById("checkName").value;
  form.long = document.getElementById("checkLong").value;
  form.lat = document.getElementById("checkLat").value;
  sendPost("checkSpot", form);
}

function sendPost(path, data) {
  console.log("Posting following to " + path, data)
	fetch(path, {
		method: "POST",
		body: JSON.stringify(data),
		headers:{
			"Content-Type": "application/json"
		}
	})
  .then(handleRes);
};

//Response handler
async function handleRes(res){
  //Await promise to fufill
  let returned = await res.json();
  console.log("Server JSON response: ", returned);
  if(returned.success){
    popUp( [ returned.data.long , returned.data.lat ] ,
        returned.data.hasWater , returned.data.hasElectricity,
        returned.data.name + ": " + returned.data.long + " , " + returned.data.lat); // Popup at Location
  }
}



function addSpot() {
  alert("Not currently supported!");
}

function toPage(data){
  console.log(data);
}
