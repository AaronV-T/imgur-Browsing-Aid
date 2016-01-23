function initializePostPreview () {
	console.log("postpreview");
	var pressedTimes = 0;
	var settingsViewAction = 0;
	var maxWidth = 35;
	var maxHeight = 23;
	var percentageSensX = 70;
	var percentageSensY = 90;
	var heightPercentage = $(window).height() / 100;
	var widthPercentage = $(window).width() / 100;
	var Ls = $("img");
	var Ll = Ls.length;
	var styles = "<style>#settingsView {font-family: Arial,sans-serif;font-weight: 700;color: #fff;background: rgb(18, 18, 17);padding: .5em;position: absolute;z-index: 99999999;text-align:middle; }.box {border: solid 2px #2B2B2B;border-radius: 5px;padding: .2em; }.setting {display: table;background: rgb(26, 26, 26);margin: 0 auto;margin-bottom: 0.5em;margin-top: .5em;}lable {display: inline-block;float: left;clear: left;width: 3.5em;text-align: right;padding-right: 3px;margin-bottom: .4em;}.buttn{font-family: Arial,sans-serif;font-weight: 700;color: #fff;text-decoration: none;outline: 0 none;-webkit-user-select: none;user-select: none;cursor: pointer;display: inline-block;text-shadow: 1px 1px 1px rgba(0,0,0,.2);border-radius: 2px;font-size: 14px;font-size: 12px;padding: 8px 20px;background: #595959;background: linear-gradient(to bottom,#595959 0,#404040 100%);filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#595959', endColorstr='#404040', GradientType=0);border-top: 1px solid #737373;border-bottom: 1px solid #262626;border-left: 0;border-right: 0;}.buttn:active{background: #474747;background: linear-gradient(to bottom,#474747 0,#3d3d3d 100%);filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#474747', endColorstr='#3d3d3d', GradientType=0);border-top: 1px solid #525252;border-bottom: 1px solid #212121;}.input{ display: inline-block; float: left;}#imageView_container {min-height: 5em;min-width: 5em;background: #272727;position: absolute;padding: .3em;z-index: 9999999; }#imageView_img {color: white;font-family: Helvetica, sans-serif; }</style>";

	console.log("Images grabbed = " + Ll);
	//Appends styles
	$("head").append(styles);

	//Calculates where imView shuld be placed. "X"
	function getMouseX(mouseX) {
		console.log(mouseX, $(window).width());
		if (mouseX > widthPercentage * percentageSensX) {
		return (mouseX - widthPercentage * 40);
		console.log(mouseX - widthPercentage * 40);
		} else {
		return (mouseX + 10);
		}
	}

	//Calculates where imView shuld be placed. "Y"
	function getMouseY(mouseY) {
		console.log(mouseY, $(window).height());
		if (mouseY > heightPercentage * percentageSensY) {
		return (mouseY - heightPercentage * 40);
		console.log(mouseY - heightPercentage * 40);
		} else {
		return (mouseY + 10);
		}
	}

	function appendImgView(mouseY, mouseX, url) {
		var imgurStyles = "<style>/*Imgur classes*/.tipsy.tipsy-n{position: absolute;top:" + parseInt(getMouseY(mouseY) - $('.tipsy').outerHeight()) + "px!important;left:" + parseInt(getMouseX(mouseX) - 5) + "px!important;max-width: 35.6em;}</style>";
		var ImgView = "<div id='imageView_container' style=' max-width:" + maxWidth + ".6em; max-height:" + maxHeight + "em; top:" + getMouseY(mouseY) + "px; left:" + getMouseX(mouseX) + "px;'>" + imgurStyles + "<img id='imageView_img' style='max-height:" + maxHeight + "em; max-width:" + maxWidth + "em;' alt='Could not show current file' src='" + url + "'/></div>";
		$("body").append(ImgView);
	};

	//Appends SettingsView on function call
	function appendSettingsView() {
		var settingsView = "<div id='settingsView' class='box' style='top:2em;left:2em;'><b>Settings</b> <div class='setting box'><b>View size</b><br><lable><b>Width:</b></lable><input id='imgViewWidth' class='input' name='width' type='number' value='" + maxWidth + "' /><lable><b>Height:</b></lable><input id='imgViewHeight' class='input' name='height' type='number' value='" + maxHeight + "' /></div> <div class='setting box'><b>Edge sensitivity</b><br><lable><b>Width:</b></lable><input id='widthPercentage' class='input' type='number' value='" + percentageSensX + "'><lable><b>Height:</b></lable><input id='heightPercentage' class='input' type='number' value='" + percentageSensY + "'> </div> <input id='saveSettings' class='buttn' type='button' value='Save settings' /> <input id='defaultSettings' class='buttn' type='button' value='Default settings' /></div>";
		$("body").append(settingsView);
		$("#settingsView").draggable();
	}

	//detect if "key" is pressed twice
	$(document).keydown(function(e) {
		if (e.keyCode == 18 && pressedTimes == 1 && settingsViewAction == 0) {
			appendSettingsView();
			pressedTimes = 0;
			settingsViewAction = 1;
		} else if (e.keyCode !== 18) {
			pressedTimes = 0;
		} else if (settingsViewAction == 1) {
			pressedTimes = 0;
		} else {
			pressedTimes++;
		}
	});

	//Saves changed settings
	$(document).on("click", "#saveSettings", function() {
		var inputMaxWidth = $("#imgViewWidth").val();
		var inputMaxHeight = $("#imgViewHeight").val();
		var inputSneseX = $("#widthPercentage").val();
		var inputSenseY = $("#heightPercentage").val();

		maxWidth = inputMaxWidth;
		maxHeight = inputMaxHeight;
		percentageSensX = inputSneseX;
		percentageSensY = inputSenseY;
		$("#settingsView").remove();
		settingsViewAction = 0;
	});

	//Resets changed settings
	$(document).on("click", "#defaultSettings", function() {
		maxWidth = 35;
		maxHeight = 23;
		percentageSensX = 70;
		percentageSensY = 90;
		$("#settingsView").remove();
		settingsViewAction = 0;
	});

	//Small img to big img filter
	$(Ls).mouseover(function(e) {
		var url = $(this).attr("src");
		var Array = url.split(".");
		var Last = Array.length - 1;
		var mouseX = e.pageX;
		var mouseY = e.pageY;
		console.log("Array = " + url);
		var Array = url.split(".");
		console.log(url + " | " + Array);
		var Meat = Array[2].split("");
		console.log("Original URL: " + url);
		console.log("Meat before: " + Meat);
		Meat.pop();
		Meat = Meat.join("");
		console.log("Meat after: " + Meat);
		Array.splice(2, 1, Meat);
		url = Array.join(".");
		console.log("New URL: " + url);

		appendImgView(mouseY, mouseX, url);
		if (Array[Last] !== "gif") {
			console.log("Link is not a image/gif file");

			console.log("None gif file detected");
			console.log("Original URL: " + url);
		
			Array.pop();
			Array.push("gif");

			url = Array.join(".");
			console.log("New URL: " + url);
		}
	});

	//Removes view on mouseout
	$(Ls).mouseout(function() {
		$("#imageView_container").remove();
		console.clear();
	});
}