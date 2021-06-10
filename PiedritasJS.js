window.onload = init; // Intialize Map upon Window Load.

function init() { // Initialization Function.

    // Map Object.
    const map = new ol.Map({  // Calling new Map Instance from OpenLayers (OL) Library.
        view: new ol.View({  // Creating the View. 
            center:  [ -9046512.814, -505599.729 ] , // Piedritas Coords.
            zoom: 14 , // Initial Zoom Level (x14)
            maxZoom: 18 , // Max Zoom Level.
            minZoom: 12  // Min Zoom Level.
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

    // -- Layer View Switching Logic -- 

    // Field for all Avaliable Layers on Webpage.
    const selectLayers = document.querySelectorAll('.sidebar > input[type=radio]');

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

        console.log(e.coordinate); 

    })
}