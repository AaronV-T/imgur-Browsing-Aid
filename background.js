chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.messageType && msg.messageType == "checkForMessage") {
		checkForMessage();
	}
});

chrome.runtime.onInstalled.addListener(function (details) {
	var extensionID = chrome.runtime.id;
	
	if (extensionID == "bmkkppdpbgfhfcppblpmbbiibeoeledm") {
		chrome.storage.sync.get({
			uniqueID: "neverSet"
		}, function(items) {
			if (items.uniqueID == "neverSet" || items.uniqueID == "developement") {
				requestNewUniqueID();
			}
		});
	}
	else {
		chrome.storage.sync.set({
			uniqueID: "developer"
		}, function() {});
	}
	
	if (details.reason == "install") {
		chrome.runtime.openOptionsPage(); 
		
		if (extensionID == "bmkkppdpbgfhfcppblpmbbiibeoeledm"){
			$.ajax({
				url: 'http://tollski.com/imgur_browsing_aid/index.php',
				type: 'post',
				data: {
					type: "install"
				},
				headers: {
					
				}
			},
			function(){

			});
		}
		else
			console.log(extensionID);
	}
	else {
		console.log(details.reason);
		chrome.storage.sync.get({ 
			useSynchronizedStorage: "neverSet"
		}, function(items) {
			if (items.useSynchronizedStorage == "neverSet") {
				chrome.runtime.openOptionsPage(); 
			}
		});
	}
});

function checkForMessage() {
	chrome.storage.sync.get({ 
		lastMessageCheck: 0,
		lastMessageID: 0
	}, function(items) {
		var lastCheck = items.lastMessageCheck;
		
		var d = new Date();
		var t = d.getTime();
		
		if (t - lastCheck > 5400000) { //If time since last message check is greater than 1.5 hours: get message from the site.
			chrome.storage.sync.get({
				uniqueID: "neverSet"
			}, function(items2) {
				if (items2.uniqueID != "neverSet" && items2.uniqueID != "developement") {	
					$.get("http://tollski.com/imgur_browsing_aid/latestMessage.php", { id: items2.uniqueID }, function(data, status){
						if (status === "success" && data.indexOf(" ") > -1) {
							var receivedMessageID = parseInt(data.substring(0, data.indexOf(" ")));
							var receivedMessageText = data.substring(data.indexOf(" ") + 1, data.length);
							
							//alert("data: " + data +". status: " + status + ". receivedMessageID: " + receivedMessageID + ". items.lastMessageID: " + items.lastMessageID);
							console.log("receivedMessageID:" + receivedMessageID + ". items.lastMessageID:" + items.lastMessageID + ".");
							
							if (receivedMessageID > items.lastMessageID) {
								console.log("message is new");
								chrome.storage.sync.set({
									lastMessageCheck: t,
									lastMessageID: receivedMessageID,
									lastMessage: receivedMessageText,
									lastMessageRead: false
								}, function() {});
							}
							else {
								console.log("message is old");
								chrome.storage.sync.set({
									lastMessageCheck: t
								}, function() {});
							}
						}
						else
							console.log("data: '" + data +"'. status: " + status);
					});
				}
				else 
					requestNewUniqueID();
			});
		}
		else
			console.log("last message check: " + ((t - lastCheck) / 1000 / 60 / 60));
	});
}

function requestNewUniqueID() {
	$.get("http://tollski.com/imgur_browsing_aid/requestID.php", { type: "newID" }, function(data, status) {
		if (status == "success" && data.indexOf("failed") == -1) {
			chrome.storage.sync.set({
				uniqueID: data
			}, function() {
				console.log("uniqueID: " + data);
			});
		}
		else
			console.log("data: '" + data +"'. status: " + status);
		
	});
}