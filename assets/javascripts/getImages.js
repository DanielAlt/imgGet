function getAllImages(){
	var to_return = [];
	var images = document.getElementsByTagName('img');
	for (var i=0; i< images.length;i++){
		to_return.push(images[i].src);
	}
	return (to_return);
}

chrome.runtime.sendMessage({
    action: "getImages",
    source: getAllImages()
});