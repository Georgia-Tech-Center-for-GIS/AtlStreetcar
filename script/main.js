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

var jsDom = null;
var layerList = ko.observable();
var streetcarLayer = null;
var baseLayers = [12,13,14,15];

function init() {
	require([
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"dojo/parser", "dojo/dom-style", 
		"dojo/domReady!"], function( ArcGISDynamicMapServiceLayer, parser, domStyle ) {

		esriConfig.defaults.io.proxyUrl = "http://carto.gis.gatech.edu/proxypage_net/proxy.ashx";
		//esriConfig.defaults.io.alwaysUseProxy = true;
		
		esri.config.defaults.io.corsEnabledServers.push("http://carto.gis.gatech.edu");		
		streetcarLayer = new ArcGISDynamicMapServiceLayer("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer");
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
		
		require(["esri/map", "http://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js" ,"dojo/domReady!"],
		function(Map, BootstrapMap) {
			map = BootstrapMap.create("map",{
				basemap: "streets",
				center: [-84.38373544973749, 33.757773938307224],
				zoom: 15,
				allowScrollbarZoom: true
			});
			
			map.on("load", function () {
				map.getLayer(map.basemapLayerIds[0]).setOpacity(0.4);
				map.addLayer(streetcarLayer);
				streetcarLayer.setVisibleLayers(baseLayers);
				
				esri.request({
					url: "layers.xml",
					handleAs: "text",
					load: function(e) {
						/*loadLayerAndLabel("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/13", "");
						loadLayerAndLabel("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/12", "");
						loadLayerAndLabel("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/11", "");*/

						jsDom = dojox.xml.DomParser.parse(e);
						layerList = ko.observable(xmlToJson(jsDom));
						ko.applyBindings();

						/*$.fn.accordion.defaults.container = false; 
						$("#menu-accordion").accordion({
							heightStyle: "content",
							obj: "div", 
							wrapper: "div", 
							el: ".h", 
							head: "h2, h3", 
							next: "div",
							initShow : "div.shown",
							activate : function(ev, ui) {
								console.debug(ui);
							}
						});*/
				}});
			});
			parser.parse();
		});
	});
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
			
			/*fl = new FeatureLayer("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/2");
			map.addLayer(fl);
			
			fl.on("load", function(e) {
			});*/
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

var currLayerTitle = ko.observable(" ");
var currLayerLegend = ko.observable(null);
var currCateg = ko.observable();

var getLegendTitle = ko.computed( function() {
	return ((currLayerTitle().trim() != "") ? "Legend - "+currLayerTitle() : "Legend - Please select a category and layer from above");
});

var isAccordionOpen = ko.computed( function(ev) {
	console.debug(this);
	
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

		if(currentLayer() != null) {
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

function loadURL_UI(evt_value) {
	require([
		"esri/tasks/query", "esri/tasks/QueryTask"],
		function(Query,QueryTask) {
			if(evt_value["@attributes"].url.length == 0)
				return;
				
			streetcarLayer.setVisibleLayers( baseLayers .concat ( evt_value["@attributes"].url ));
			
			var qt = new QueryTask("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/AtlStreetcar/PopulationAndHospitality/MapServer/" +
				evt_value["@attributes"].url);
			var q  = new Query();
			
			q.returnGeometry = true;
			q.outFields = ["*"];
			q.where = "1=1";	
	
			qt.execute(q);
			qt.on("complete", function(results) {
				currLayerTitle(evt_value["#text"]);
				//currentLayer().graphics = currentLayer().features;
				
				currentLayer(null);
				headings(null);
				
				$('#featureTable table').fixedHeaderTable('destroy');
				
				//$("tr:odd").css({"backgroundColor": '#ccc'});
				
				currentLayer(results.featureSet);
				setupTableHeadings();
				
				$('#featureTable table').fixedHeaderTable({ footer: false, fixedColumn: false });
				
				esri.request({
					url: streetcarLayer.url + "/legend",
					content : {
						f: "JSON"
					},
					load : function(result) {
						currLayerLegend(result.layers[ parseInt(evt_value["@attributes"].url) ]);
						
						//legendDlg = $("#legend").dialog({dialogClass: "no-close", title: currLayerTitle() });
					}
				});
			});
	});
}

var lastGraphic = null;

function doActualZoomToFeature( geom ) {
	var b = geom.geometries[0];
	
	lastGraphic = b;
	
	if(b.type == "point") {
		map.setExtent( new esri.geometry.Extent(b.x-150,b.y-150,b.x+150,b.y+150, map.spatialReference) );
	}
	else {
		map.setExtent( b.getExtent().expand(1.75) );
	}
}

function zoomToFeature( feature ){
	require(["esri/tasks/GeometryService", "esri/tasks/ProjectParameters"],
		function(GeometryService, ProjectParameters) {
			b = feature.geometry;
			
			
			if( b.spatialReference.wkid != map.spatialReference.wkid ) {
				
				var gs = new GeometryService("http://tulip.gis.gatech.edu:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
				var params = new ProjectParameters();
				params.geometries = [b];
				params.outSR = map.spatialReference;
				
				gs.project(params);
				gs.on("project-complete", doActualZoomToFeature);
			}
			else {
				doActualZoomToFeature([b]);
			}
	});
}

init();

//loadKMLLayerAndLabel("http://carto.gis.gatech.edu/StreetcarData/Hospitality_Hotel.kmz", "Hotel");			
//loadLayerAndLabel("http://carto.gis.gatech.edu/StreetcarData/Historic_Buffer.csv", "TITLE");

//		loadLayerAndLabel("http://carto.gis.gatech.edu/coast/Hospitality_Hotel.kmz", "name");
//		loadLayerAndLabel("http://carto.gis.gatech.edu/coast/Hospitality_Historic.kmz", "name");
//		loadLayerAndLabel("http://carto.gis.gatech.edu/StreetcarData/HHOwnRenter.kmz", "");
//		loadLayerAndLabel("http://carto.gis.gatech.edu/coast/Landmark.kmz", "name");