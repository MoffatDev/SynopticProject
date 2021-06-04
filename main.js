window.onload = init;

function init() {
    const map = new ol.Map({
        view: new ol.View({
            center: [ -9047783.58 , -496188.42] , 
            zoom: 4 , 
            maxZoom: 10 , 
            minZoom: 4
        }) , 

        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ], 

        target: 'map'
    });

    map.on('click' , function(e) {

        console.log(e.coordinate); 

    })
}

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openBar() {
    document.getElementById("sidebar").style.width = "23%";
    document.getElementById("main").style.marginRight = "23%";
  }
  
  /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
  function closeBar() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
  }