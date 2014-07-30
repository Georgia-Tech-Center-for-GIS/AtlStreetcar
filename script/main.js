// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).slideDown() : $(element).slideUp();
    }
};

function xmlToJson(xml) {
	var obj = {};
	try {
		// Create the return object

		if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes != null && xml.attributes.length > 0) {
		obj["@attributes"] = {};
		  for (var j = 0; j < xml.attributes.length; j++) {
			var attribute = xml.attributes[j];
			obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
		  }
		}
		} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
		}

		// do children
		if (xml.childNodes != null && xml.childNodes.length > 0) {
		for(var i = 0; i < xml.childNodes.length; i++) {
		  var item = xml.childNodes[i];

		  var nodeName = item.nodeName;
		  if (typeof(obj[nodeName]) == "undefined") {
			obj[nodeName] = xmlToJson(item);
		  } else {
			if (typeof(obj[nodeName].length) == "undefined") {
			  var old = obj[nodeName];
			  obj[nodeName] = [];
			  obj[nodeName].push(old);
			}
			obj[nodeName].push(xmlToJson(item));
		  }
		}
		}
	}
	catch( exception ) {
		console.debug(exception);
	}

	return obj;
};

function parseXml(xml, arrayTags)
{
	var dom = null;

	if (window.DOMParser)
	{
		dom = (new DOMParser()).parseFromString(xml, "text/xml");
	}
	else if (window.ActiveXObject)
	{
		dom = new ActiveXObject('Microsoft.XMLDOM');
		dom.async = false;
		if (!dom.loadXML(xml))
		{
			throw dom.parseError.reason + " " + dom.parseError.srcText;
		}
	}
	else
	{
		throw "cannot parse xml string!";
	}

	function isArray(o)
	{
		return Object.prototype.toString.apply(o) === '[object Array]';
	}

	function parseNode(xmlNode, result)
	{
		if(xmlNode.nodeName == "#text" && xmlNode.nodeValue.trim() == "")
		{
			return;
		}

		var jsonNode = {};
		var existing = result[xmlNode.nodeName];
		if(existing)
		{
			if(!isArray(existing))
			{
				result[xmlNode.nodeName] = [existing, jsonNode];
			}
			else
			{
				result[xmlNode.nodeName].push(jsonNode);
			}
		}
		else
		{
			if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1)
			{
				result[xmlNode.nodeName] = [jsonNode];
			}
			else
			{
				result[xmlNode.nodeName] = jsonNode;
			}
		}

		if(xmlNode.attributes)
		{
			var length = xmlNode.attributes.length;
			for(var i = 0; i < length; i++)
			{
				var attribute = xmlNode.attributes[i];
				jsonNode[attribute.nodeName] = attribute.nodeValue;
			}
		}

		var length = xmlNode.childNodes.length;
		for(var i = 0; i < length; i++)
		{
			parseNode(xmlNode.childNodes[i], jsonNode);
		}
	}

	var result = {};
	if(dom.childNodes.length)
	{
		parseNode(dom.childNodes[0], result);
	}

	return result;
}

var map = null;
var labelLayerScale = null;
var labelLayerNoScale = null;
var tempGraphicsLayer = null;

dojo.require("dojox.xml.DomParser");
dojo.require("esri.dijit.TimeSlider");
dojo.require("esri.dijit.Print");

var jsDom = null;
var lyrQueryTask = null;
var layerList = ko.observable();

var streetcarLayerURL = "http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/";
var streetcarLayer = null;
var baseLayers = [0,1,2,3];
var lastDisplayField = "";
var attribHidden = ko.observable(false);

var navToolbar = null;
var fullExtent = null;

var isChartShowing = ko.observable(false);
<<<<<<< HEAD

var isCSVShowing = ko.observable(false);

=======
<<<<<<< HEAD
var isCSVShowing = ko.observable(false);
=======
>>>>>>> FETCH_HEAD
>>>>>>> origin/master
var chartImageData = ko.observable("");

var timeSelValue = ko.observable();
var timeSliderVisible = ko.observable(false);
var timeLayerIds = ko.observableArray([]);
var timeSlider = null;
var timeSliderEnabled = ko.observable(false);

var printer = null;

var currIcon = ko.observable("Pan Map");

<<<<<<< HEAD

var specialChart = ko.observable();

=======
<<<<<<< HEAD
var specialChart = ko.observable();

=======
>>>>>>> FETCH_HEAD
>>>>>>> origin/master
function showFeatureSet(fset,evt) {
//remove all graphics on the maps graphics layer
map.graphics.clear();

	var screenPoint = null;
	if(evt.screenPoint != "undefined") {
		screenPoint = evt.screenPoint;
	}
	else if(evt.geometry != "undefined"){
		screenPoint = map.toScreen( evt.geometry.getCentroid() );
	}
	

featureSet = fset;

var numFeatures = featureSet.features.length;

//QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the infowindow.
var title = "You have selected " + numFeatures + " features.";
var content = "Please select desired feature from the list below.<br />";

for (var i=0; i<numFeatures; i++) {
  var graphic = featureSet.features[i];
  content = content + graphic.attributes[featureSet.displayFieldName] + " (<a href='#' onclick='showFeature(featureSet.features[" + i + "]);'>show</a>)<br/>";
}

map.infoWindow.setTitle(title);
map.infoWindow.setContent(content);
map.infoWindow.show(screenPoint,map.getInfoWindowAnchor(screenPoint));
}

function showFeature(feature, ev) {

	var contentString = "<table><tr><th colspan='2'><h2>" + feature.attributes[lastDisplayField] + "</h2></th></tr>";
	for (var x in feature.attributes) {
		if (x !== "OBJECTID" && x !== "Shape") {
			contentString = contentString + "<tr><th>"+
				x +"</th><td>" +
				feature.attributes[x] + "</td></tr>";
		}
	}
	
	contentString = contentString + "</table>";
	
	zoomToFeature(feature);
	 
	map.infoWindow.setContent(contentString);
  map.infoWindow.setTitle("");
	 
require(["esri/dijit/InfoWindow"], function(InfoWindow){
  map.infoWindow.show(feature.geometry, InfoWindow.ANCHOR_UPPERRIGHT);
});

}

function init() {
	require([
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/FeatureLayer",
		"esri/tasks/query",
		"esri/toolbars/navigation",
		"dijit/registry",
		"dojo/on",
		"dojo/parser", "dojo/dom-style", 
		"esri/tasks/query", 
		"esri/toolbars/draw",
		"esri/TimeExtent", 
		"esri/dijit/TimeSlider",
        "dojo/_base/array", 
		"dojo/dom",
		"dojo/domReady!"],
			function(
		ArcGISDynamicMapServiceLayer, FeatureLayer, Query, Navigation, registry, on, parser, domStyle, Query, Draw, TimeExtent, TimeSlider,
        arrayUtils, dom ) {
			
		esriConfig.defaults.io.proxyUrl = "http://carto.gis.gatech.edu/proxypage_net/proxy.ashx";
		//esriConfig.defaults.io.alwaysUseProxy = true;
		
		esri.config.defaults.io.corsEnabledServers.push("http://carto.gis.gatech.edu");		
		streetcarLayer = new ArcGISDynamicMapServiceLayer(streetcarLayerURL);
/*
		require(["http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js"],
			function (BootstrapMap) {
				map = new BootstrapMap.create("map", { 
					basemap: "streets",
					center: [-84.38373544973749, 33.757773938307224],
					zoom: 15
			});
		});
*/
		
		require(["esri/map", "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js",
			"dojo/domReady!"],
		function(Map, BootstrapMap) {
			
			map = BootstrapMap.create("map",{
				basemap: "streets",
				center: [-84.38373544973749, 33.757773938307224],
				zoom: 15,
				allowScrollbarZoom: true,
			});
			
			map.addLayer(streetcarLayer);
			
			map.on("load", function () {
				map.getLayer(map.basemapLayerIds[0]).setOpacity(0.4);
				
				streetcarLayer.setVisibleLayers(baseLayers);
				
				map.enableScrollWheelZoom();
				drawToolbar = new esri.toolbars.Draw(map);
  				navToolbar = new esri.toolbars.Navigation(map);
  				fullExtent = map.extent;

				drawToolbar.on("draw-complete", function(evt) {
					if(currLayerTitle() == "" || currLayerTitle() == null) return;			
					
					require(["esri/tasks/query", "esri/tasks/QueryTask",
						"esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
						"esri/Color", "esri/geometry/Circle", "esri/graphic"
					],
					function(Query,QueryTask,
						SimpleFillSymbol,SimpleLineSymbol,Color,
						Circle,Graphic) {
			//				var defaultSymbol, highlightSymbol, resultTemplate;
			//				defaultSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0,0,255]));
			//				highlightSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([255,0,0]));

							var qry = new Query();
							var lyrQueryTask = new QueryTask(streetcarLayerURL + currLayerIndex());
							
							qry.where = "1=1";
							qry.outFields = ["*"];
							qry.returnGeometry = true;
							qry.geometry = evt.geometry;
							
							console.debug(lyrQueryTask);
							
							lyrQueryTask.execute(qry);
							lyrQueryTask.on("complete", function(results) {
								if(results.featureSet.features.length > 0) {
									lastDisplayField = results.featureSet.displayFieldName;
									
									if(results.featureSet.features.length > 1) {
										showFeatureSet(results.featureSet, evt);
									}
									else {
										showFeature(results.featureSet.features[0], evt);
									}
								}
							});
					});
				});				
				//initToolbar(map);
				
				$("#loadingScreen").css("display", "none");

				esri.request({
					url: "layers.xml",
					handleAs: "text",
					load: function(e) {
						jsDom = dojox.xml.DomParser.parse(e);
						layerList = ko.observable(xmlToJson(jsDom));
						ko.applyBindings();
						map.resize();
						}});
				
				//ko.applyBindings();
				
				$('#zoomPrevBtn').on('click', function(e) {
					currIcon("Zoom to Previous Extent");
				
					navToolbar.zoomToPrevExtent();
				});
			
				$('#zoomNextBtn').on('click', function(e) {
					currIcon("Zoom to Next Extent");
					
					navToolbar.zoomToNextExtent();
				});
				
				$('#zoomInBtn').on('click', function(e) {
					currIcon("Zoom In");
				
				//map.setMapCursor("url(images/images/glyphicons_236_zoom_in.png),auto");
					drawToolbar.deactivate();
					navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
			    });
				
				$('#zoomOutBtn').on('click', function(e) {
					currIcon("Zoom Out");
				
				//map.setMapCursor("url(images/zoom_in.cur),auto");
					drawToolbar.deactivate();
					navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);	
			    });
			  
				$('#circleSelect').on('click', function(e) {
					currIcon("Select points within a circle");
					
					navToolbar.deactivate();
					drawToolbar.activate(esri.toolbars.Draw.CIRCLE);
				});
				
				$('#panBtn').on('click', function(e) {
					currIcon("Pan Map");
					
					navToolbar.activate(esri.toolbars.Navigation.PAN);
					drawToolbar.deactivate();
				});				
				
				$('.showTimeSliderIcon').on('click', function(e) {
					currIcon("Show Time Slider");
					
					(timeSliderVisible(!timeSliderVisible()));
				});
		});
	});
});
}

/*function initSlider() {
	require([ 
        "esri/TimeExtent", "esri/dijit/TimeSlider",
        "dojo/_base/array", "dojo/dom", "dojo/domReady!"],
		function(TimeExtent, TimeSlider, arrayUtils, dom) {
          var timeSlider = new TimeSlider({
            style: "width: 100%;"
          }, dom.byId("timeSliderDiv"));
          map.setTimeSlider(timeSlider);
		  
		timeSliderVisible(false);
		timeSliderEnabled(timeLayerIds().length > 0);
	
		if(timeLayerIds().length == 0) {
		timeSliderEnabled(false);
		return;
		}
		else
		{
          
          var timeExtent = new TimeExtent();
          timeExtent.startTime = new Date("1/1/1990 UTC");
		  map.setTimeExtent(timeExtent);
          timeExtent.endTime = new Date("12/31/2015 UTC");
          timeSlider.setThumbCount(2);
          timeSlider.createTimeStopsByTimeInterval(timeExtent, 2, "esriTimeUnitsYears");
          timeSlider.setThumbIndexes([0,1]);
          timeSlider.setThumbMovingRate(2000);
          timeSlider.startup();
          
          //add labels for every other time stop
          var labels = arrayUtils.map(timeSlider.timeStops, function(timeStop, i) { 
            if ( i % 2 === 0 ) {
              return timeStop.getUTCFullYear(); 
            } else {
              return "";
            }
          }); 
          
          timeSlider.setLabels(labels);
          
          timeSlider.on("time-extent-change", function(evt) {
            var startValString = evt.startTime.getUTCFullYear();
            var endValString = evt.endTime.getUTCFullYear();
            dom.byId("daterange").innerHTML = "<i>" + startValString + " and " + endValString  + "<\/i>";
          });
		  
		}
		  });
}*/


	/**
If there are time-enabled layers enumerated, turn on the time slider, etc.
*/
/*function checkTimeLayers() {
	console.log("hello");
	//timeSliderVisible(timeLayerIds().length > 0);
	timeSliderVisible(false);
	timeSliderEnabled(timeLayerIds().length > 0);
	
	if(timeLayerIds().length == 0) {
		timeSliderEnabled(false);
		return;
	}
	else
	{
		var timeExtent = new esri.TimeExtent();
		timeExtent.startTime = new Date("1/1/2011 EST");
		map.setTimeExtent(timeExtent);

		if(timeSlider == null) {
			timeSlider = new esri.dijit.TimeSlider({
			  style: "width: 800px;"
			}, dojo.byId("timeSliderDiv"));

			map.setTimeSlider(timeSlider);
			timeSlider.setThumbCount(2);
			
			var layerTimeExtent = map.getLayer( map.layerIds[5] ).timeInfo.timeExtent;

			layerTimeExtent.startTime = timeExtent.startTime;
			timeSlider.createTimeStopsByTimeInterval(layerTimeExtent, 1, 'esriTimeUnitsMonths');
			timeSlider.setThumbMovingRate(1500);			
			timeSlider.setLoop(true);
			timeSlider.setLabels(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
			timeSlider.startup();
			
			//timeSlider.setThumbIndexes([0,1]);
			
			$('#timeSliderChoicesSelect').change( function(ev) {
				if(loaded()) {
					var l = map.getLayer( map.layerIds[5] );

					if( l != null ) {
						var valToShow = timeSelValue();
						var tLayerIds = timeLayerIds();
						
						console.debug(valToShow);
						
						for(var lllll = 0; lllll < tLayerIds.length; lllll++) {
							if( viewModel.isVisibleLayer( map.layerIds[5], parseInt(tLayerIds[lllll].id) ) ) {
									viewModel.toggleVisibleLayer( { "mapLayerId" : map.layerIds[5], "esriLayer" : { id: parseInt(tLayerIds[lllll].id) } } )
								}
						}
						
						viewModel.toggleVisibleLayer( { "mapLayerId" : map.layerIds[5], "esriLayer" : { id: parseInt(valToShow) } } )
						l.refresh();
					}
				}
			});
		}
	}
}
*/
		
//initialize drawing toolbar
function initToolbar(map) {
	var tb = new esri.toolbars.Draw(map);
	//find points in Extent when user completes drawing extent
	//dojo.connect(tb, "onDrawEnd", findPointsInExtent);
	//set drawing mode to extent
	tb.activate(esri.toolbars.Draw.CIRCLE);
	

}

/** Do we label the next KML file to finish loading.... */
var doLabels = false;

function whenGraphicsLoaded(evt) {
	require([
		"esri/Color", "esri/symbols/Font",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/TextSymbol",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/renderers/SimpleRenderer",
		"dojo/parser", "dojo/dom-style",
		"dojo/domReady!"],

		function(Color, Font, SimpleFillSymbol, TextSymbol, SimpleMarkerSymbol,
			SimpleRenderer,
			parser, domStyle) {

		try {
		}
		catch(e) {
			console.debug(e);
		}
	});
}

var LayerAttributes = ko.observableArray();

/** Label the kml features when done loading */
function whenLoadedAndLabel(evt) {
	require([
		"esri/layers/GraphicsLayer",
		"esri/Color", "esri/symbols/Font",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/renderers/SimpleRenderer",
		"dojo/parser", "dojo/dom-style",
		"dojo/domReady!"],
		function(GraphicsLayer, Color, Font, SimpleMarkerSymbol,
		SimpleRenderer, parser, domStyle) {

		if(! evt.layer.loaded) {
			evt.layer.on("load", whenLoadedAndLabel);
		}

		currentLayer(evt.layer);
		setupTableHeadings();

		//tempGraphicsLayer.on("load", whenGraphicsLoaded);
		whenGraphicsLoaded( {layer : evt.layer, name: evt.layer.url } );
	});
}

var lastLayer = null;

function whenLoadedDontLabel(evt) {
	lastLayer = evt.layer;
	
	if(evt.layer.getLayers().length == 0) return;

	currentLayer(evt.layer.getLayers()[0]);
	setupTableHeadings();

	dojo.forEach(evt.layer.getLayers()[0].graphics, function(feature) {
		feature.attributes.balloonStyleText =
			"<a href='https://www.google.com/#q=" +
			feature.attributes.name + "\'>" + feature.attributes.name + "</a>";

		var xmlObject = dojox.xml.DomParser.parse(feature.attributes.description);
		var jsoObject = xmlToJson(xmlObject);
		dojo.forEach(jsoObject.html.head.META.body.table.tr[1].td.table.tr, function(attribPair) {
			feature.attributes[ attribPair.td[0]["#text"] ] = attribPair.td[1]["#text"];
		});					
	});
}

function loadLayerAndLabel(url, label, markerSize, symField, minVal, maxVal) {
	require([
		"esri/layers/CSVLayer",
		"esri/layers/KMLLayer",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/FeatureLayer",
		"esri/layers/LabelLayer",
		
		/*arcgisdynamicmapservicelayer*/
		"esri/layers/GraphicsLayer",
		"esri/Color", "esri/symbols/Font",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/renderers/SimpleRenderer",

		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/TextSymbol",

		"dojo/parser", "dojo/dom-style",
		"dojo/domReady!"],
		function(CSVLayer, KMLLayer, ArcGISDynamicMapServiceLayer, FeatureLayer, LabelLayer,
		GraphicsLayer, Color, Font, SimpleMarkerSymbol, SimpleRenderer,
		SimpleFillSymbol, TextSymbol,
		
		parser, domStyle) {

		var kml = null;
		
		lastUrl = url;
		doLabels = "";

		if(url.lastIndexOf(".csv") > -1) {
			esriConfig.defaults.io.alwaysUseProxy = true;
			kml = new CSVLayer(url, {"id": url});
		}
		else if(url.lastIndexOf(".kmz") > -1) {
			esriConfig.defaults.io.alwaysUseProxy = false;
			kml = new KMLLayer(url, {"id": url });
		}
		else {
			esriConfig.defaults.io.alwaysUseProxy = true;
			kml = new ArcGISDynamicMapServiceLayer( url, {"id":url});
			map.addLayer(kml);			
		}

		if(url.lastIndexOf(".kmz") > -1) {
			//evt.layer.setRenderer(null);

			kml.on("load", whenLoadedDontLabel);
		}
		else if(url.lastIndexOf(".csv") > -1) {
			//kml.on("load", whenLoadedAndLabel);

			var marker = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, markerSize, null, new Color("#008"));				
			var renderer = new SimpleRenderer(marker);
			console.debug(symField + " " + minVal + " " + maxVal);
			
			renderer.setColorInfo({
				field: symField,
				minDataValue: minVal,
				maxDataValue: maxVal,
				colors: [
					new Color([255, 255, 255]),
					new Color([127, 127, 0])
				]
			});

			kml.setRenderer(renderer);

			doLabelLayer(kml, url, label);
		}
		else {
			
		}
	});
}

function doLabelLayer(lyr, url, field) {
	require([
		"esri/symbols/TextSymbol", "esri/layers/LabelLayer",
		"esri/renderers/SimpleRenderer",
		"esri/Color", "esri/symbols/Font",
		],
		function(TextSymbol, LabelLayer, SimpleRenderer, Color, Font) {					
			labelLayerNoScale = new LabelLayer({id:"labelLayer_NoLimit"});
			labelLayerScale = new LabelLayer( {id:"labelLayer_ScaleLimit",
				minScale: 10500,
				maxScale: 0});

			map.addLayer(labelLayerScale);
			map.addLayer(labelLayerNoScale);

			var labelTextSymbol = new TextSymbol().setColor(new Color("#0"));
			labelTextSymbol.font.setWeight(Font.WEIGHT_BOLD);
			labelTextSymbol.font.setSize("12pt");
			labelTextSymbol.font.setFamily("arial");
			
			if(lyr.url.lastIndexOf("Hotel") > -1) {
				labelLayerScale.addFeatureLayer(lyr,
					new SimpleRenderer(labelTextSymbol), "${"+field+"}");
				labelLayerScale.refresh();
			}
			else {
				labelLayerNoScale.addFeatureLayer(lyr,
					new SimpleRenderer(labelTextSymbol), "${"+field+"}");
				labelLayerNoScale.refresh();
			}
		});
}

var urlsLoaded = ko.observableArray([]);
var currentLayer = ko.observable(null);
var headings = ko.observableArray([]);

var currLayerIndex = ko.observable(null);
var currLayerTitle = ko.observable("");
var currLayerLegend = ko.observable(null);
var currCateg = ko.observable(null);

var getLegendTitle = ko.computed( function() {
	return ((currLayerTitle().trim() != "") ? "Legend - "+currLayerTitle() : "Legend - Please select a category and layer from above");
});

var isAccordionOpen = ko.computed( function(ev) {
	return "accordion-category-open";
});

function changeIt(ev) {
	var a = ev["@attributes"].name;
	
	if(currCateg() == a) {
		currCateg(null);
	}
	else {
		currCateg(a);
	}
}

function setupTableHeadings() {
	require([
		"dojo/_base/array"],
		function(array) {

		if(currentLayer() != null && currentLayer().features.length > 0) {
			var DisplayAttribs = array.filter( (Object.keys(currentLayer().features[0].attributes)) , function(item, index, array) {
				if( item == "description" || item == "balloonStyleText" ||
					item == "styleUrl" || item == "id" || item == "FID") return false;
				return true;
			});
			headings(DisplayAttribs);
		}
	});
}

var legendDlg  = null;
var lastInfoTemplate = null;

function loadAttributes() {
	require([
		"esri/tasks/GeometryService", "esri/tasks/ProjectParameters",
		"esri/symbols/SimpleMarkerSymbol", "esri/Color", "esri/graphic",
		"esri/tasks/query", "esri/tasks/QueryTask"],
		function(GeometryService, ProjectParameters, SimpleMarkerSymbol, Color, Graphic, Query,QueryTask) {

			if(currLayerIndex() <= 0) return;
			
			var lyrQueryTask = new QueryTask(streetcarLayerURL + currLayerIndex());
			
			var q  = new Query();
			
			q.returnGeometry = true;
			q.outFields = ["*"];
			q.where = "1=1";
			
			$("#loadingScreen").css("display", "block");
	
			lyrQueryTask.execute(q);
			lyrQueryTask.on("complete", function(results) {
				currentLayer(null);
				headings(null);
				map.graphics.clear();

				$('#featureTable table').fixedHeaderTable('destroy');
				
				//$("tr:odd").css({"backgroundColor": '#ccc'});
							
				var contentString = "<table><tr><th colspan='2'>" + "${"+ results.featureSet.displayFieldName +"}" + "</th></tr>";
				for (var x in results.featureSet.fields) {
					if (x !== "OBJECTID" && x !== "Shape") {
						contentString = contentString + "<tr><th>"+ results.featureSet.fields[x].name +"</th><td>${" + results.featureSet.fields[x].name + "}</td></tr>";
					}
				}
				
				contentString = contentString + "</table>";

				lastInfoTemplate = new esri.InfoTemplate();
				lastInfoTemplate.setTitle("Results");
				lastInfoTemplate.setContent(contentString);
				
					if(true) {
						dojo.forEach(results.featureSet.features, function(feature) {
							console.debug(feature.geometry);
							console.debug(feature.attributes);
							
							var markerSymbol = new SimpleMarkerSymbol().setStyle(
								SimpleMarkerSymbol.STYLE_CIRCLE).setColor(
								new Color([0, 0, 0, 0]));
							markerSymbol.size = 3;
							markerSymbol.outline = null;
								
							var graphik = null;
								
							if( feature.geometry.spatialReference.wkid != map.spatialReference.wkid ) {
								var gs = new GeometryService("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
								var params = new ProjectParameters();
								params.geometries = [feature.geometry];
								params.outSR = map.spatialReference;
								
								gs.project(params);
								gs.on("project-complete", function(results) {
									graphik = new Graphic(results.geometries[0], markerSymbol, feature.attributes, lastInfoTemplate);
									map.graphics.add(graphik);
								});
							}
							else {
								graphik = new Graphic(feature.geometry, markerSymbol, feature.attributes, lastInfoTemplate);
								map.graphics.add(graphik);
							}
						});
					}
								
				attribHidden(false);
				currentLayer(results.featureSet);
				setupTableHeadings();
				
				$('#featureTable table').fixedHeaderTable({ footer: false, fixedColumn: false });
				$("#loadingScreen").css("display", "none");
				
				map.resize();
			});
	});
}

function loadURL_UI(evt_value) {
	require([
		"esri/tasks/query", "esri/tasks/QueryTask"],
		function(Query,QueryTask) {
		  
      if(evt_value["@attributes"].chart != undefined){
		isChartShowing( true );
		chartImageData( evt_value["@attributes"].chart );
		currLayerIndex(-1);
		/*
			chart_url = evt_value["@attributes"].chart;
			$('#map').hide();
			currLayerIndex(-1);
			img = document.createElement('img');
			img.src = chart_url;
			document.getElementById("mapContainer").appendChild(img);
			//console.log("chart");
		*/
        return;
      }
	else if(evt_value["@attributes"].report == 1){
		currLayerIndex(-2);
		isChartShowing(true);
		chartImageData( "" );
		showCSVChart();
	}
	else {	  
	  isChartShowing( false );
	  chartImageData( "" );
<<<<<<< HEAD
		  
=======
<<<<<<< HEAD
	  
	      if(evt_value["@attributes"].report=1){
	      isCSVShowing(true);
	      showCSVChart();
	      console.log("hehe");
	      }
	      
	      isCSVShowing(false);
=======
>>>>>>> FETCH_HEAD
		
>>>>>>> origin/master
      	if(evt_value["@attributes"].url.length == 0)
				return;
				
			streetcarLayer.setVisibleLayers( baseLayers .concat ( evt_value["@attributes"].url ));
			currLayerIndex(parseInt( evt_value["@attributes"].url ));
			lyrQueryTask = new QueryTask(streetcarLayerURL + currLayerIndex());
			
			esri.request({
				url: streetcarLayer.url + "/legend",
				content : {
					f: "JSON"
				},
				load : function(result) {
					$('#featureTable table').fixedHeaderTable('destroy');
					currentLayer(null);
					headings(null);

					currLayerTitle(evt_value["#text"]);
					currLayerLegend(result.layers[ currLayerIndex() - 1 ]);
					map.setExtent(fullExtent);
					map.resize();
					map.graphics.clear();
					map.infoWindow.hide();
					//legendDlg = $("#legend").dialog({dialogClass: "no-close", title: currLayerTitle() });
				}
			});
	}
	});
}

var lastGraphic = null;
var previousInfoTemplate = null;
var previousAttributes = null;

  
function doActualZoomToFeature( geom, attrib ) {
  require(["esri/geometry", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/Color", "esri/InfoTemplate", "esri/graphic"],
    function(Point, SimpleMarkerSymbol,SimpleFillSymbol, SimpleLineSymbol, Color,InfoTemplate,Graphic) {      
      var b = geom.geometries[0];
      lastGraphic = b;

      map.graphics.clear();

      var grph = new Graphic(b);

      if(b.type == "point") {
        var sms = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 9, null, new Color("#FFFF00"));
        grph.symbol = sms;

        map.setExtent( new esri.geometry.Extent(b.x-150,b.y-150,b.x+150,b.y+150, map.spatialReference) );
      }
      else if(b.type == "polygon") {
        
        var sfs = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        	new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
    		new Color([255,0,0]), 2), new Color("#FFFF00"));

        grph.symbol = sfs;
        
        map.setExtent( b.getExtent().expand(1.75) );
      }

      map.graphics.add(grph);
  });
}


function zoomToFeature( feature ){
	require(["esri/tasks/GeometryService", "esri/tasks/ProjectParameters",
			 "esri/InfoTemplate"],
		function(GeometryService, ProjectParameters, InfoTemplate) {
			console.debug(feature);
			b = feature.geometry;
			previousAttributes = feature.attributes;

			if( b.spatialReference.wkid != map.spatialReference.wkid ) {				
				var gs = new GeometryService("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
				var params = new ProjectParameters();
				params.geometries = [b];
				params.outSR = map.spatialReference;
				
				gs.project(params);
				gs.on("project-complete", doActualZoomToFeature);
			}
			else {
				doActualZoomToFeature({geometries:[b]});
			}
	});
}

function doShowPrintDlg() {
	$("#printing-popover").show();
}

function showCSVChart() {
<<<<<<< HEAD
	require(["esri/request"],
		function(request){
			esri.request( {
				url: "./charts/StudentPopulation.csv",
				handleAs: "text",
			}).then(function(response){
				specialChart( CSVToArray(response) );
			});
		});
}
=======
require(["esri/request"],
function(request){
esri.request( {
url: "./charts/StudentPopulation.csv",
handleAs: "text",
}).then(function(response){
specialChart( CSV2JSON(response) );
});
});
}

>>>>>>> origin/master
			
init();