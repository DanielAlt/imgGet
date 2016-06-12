/* 
imgGet (c) 2016 Daniel Altenburg | All Rights Reserved. 

imgGet is a Google Chrome/Chromium browser extension that
allows users to quickly find, select, and download all images
from a particular webpage.

*/

// Helper Function for Injecting Javascript into the current Page. 
var exec = function(script_path){
	chrome.tabs.executeScript(null, {file: script_path}, function(){});
};

// Helper Funciton to print output to the Output Console. 
var println = function(text){
	$('#console').val( $('#console').val() + text);
};

// Helper Function for Extracting Base64 Data from Images 
var getBase64Image = function(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

// Initializing Zip Implementation
var zip = new JSZip();
var images = [];
var processed = 0;

$(document).ready(function(){

	//Select All
	$('#selectall_toggle').change(function(event){
		if ($( this ).prop( "checked" )){
			$('.checker').each(function(){
				$(this).prop('checked', true);
			});
		} else{
			$('.checker').each(function(){
				$(this).prop('checked', false);
			});
		}
	});

	// Process Images for Download
	$("#dl_all").click(function(event){
		
		println("\nGetting Selected Images.");
		var images_selected = [];
		for (var i=0; i < images.length; i++){
			if ($('#checkbox_' + i).prop('checked')){
				images_selected.push(images[i]);
			}
		}

		if (images_selected.length > 0){
			println("\nGetting Base64 Image Data.");
			for (var i=0; i < images_selected.length; i++){
		    	image = new Image();
		    	image.src = images_selected[i];

		    	image.onload = function(){
			    	img_str = this.src.slice(this.src.lastIndexOf("/")+1, this.src.length-4);
		    		imageData = getBase64Image(this);
		    		zip.file("images/" + img_str + '.png', imageData, {base64: true});
		    		processed += 1;

		    		println("\nZipping " + image.id);
		    		if (processed >= images_selected.length){
		    			var event = new Event('processed');
		    			document.dispatchEvent(event);
		    		}
		    	};
		    };
		} else {
			println("\nNo Images Selected");
		}
	});

	// Create a Zipfile of Images in Memory
	document.addEventListener('processed', function(){
		println('Image Data Got. Creating Zip File.')
		zip.generateAsync({type:"blob"}).then(function (blob) {
		    saveAs(blob, "images.zip");
		});
	});

	// Grab Images from the Page
	println("Injecting script...");
	exec("/assets/javascripts/getImages.js");
});

// Update the GUI with the images and their links
chrome.runtime.onMessage.addListener(function(request, sender) { 
	if (request.action == "getImages") {
	    var contents = request.source;
	    images = contents;
	    $("#count").html("(" + contents.length + " images)");
		println("\nScript returned with " + contents.length + " image refs.");

	    for (var i=0; i<contents.length; i++){
	    	// Appending Image to Screen
	    	$('#checklist').append(
	    		'<div class="row">' + 
	    		'<div class="left_row"><img src="' + contents[i] + '" class="thumb" width="45" /></div>' +
	    		'<div class="middle_row"><a target="_blank" href="'+ contents[i] + '">' + contents[i] + '</a></div>' +
	    		'<div class="right_row"><input class="checker" type="checkbox" id="checkbox_'+ i +'" checked="true"></div>' + 
	    		'</div>'
	    	);
	    }
	}
});