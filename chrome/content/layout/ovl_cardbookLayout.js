if ("undefined" == typeof(ovl_cardbookLayout)) {
	Components.utils.import("resource://gre/modules/Services.jsm");

	var ovl_cardbookLayout = {

		changeResizePanes: function(aPref, aValue) {
			var prefs = Services.prefs;
			if (aValue) {
				prefs.setBoolPref("extensions.cardbook." + aPref, aValue);
			} else {
				prefs.setBoolPref("extensions.cardbook." + aPref, !prefs.getBoolPref("extensions.cardbook." + aPref));
			}
		},

		resizePanes: function() {
			if (document.getElementById("cardsBox") && document.getElementById("dirTreeSplitter")) {
				var prefs = Services.prefs;
				if (prefs.getBoolPref("extensions.cardbook.viewABPane")) {
					document.getElementById("dirTreeSplitter").setAttribute("state", "open");
				} else {
					document.getElementById("dirTreeSplitter").setAttribute("state", "collapsed");
				}
				if (prefs.getBoolPref("extensions.cardbook.viewABContact")) {
					document.getElementById("resultsSplitterModern").setAttribute("state", "open");
					document.getElementById("resultsSplitterClassical").setAttribute("state", "open");
					document.getElementById("resultsSplitterClassical").setAttribute("class", "cardbookVerticalSplitterClass");
				} else {
					document.getElementById("resultsSplitterModern").setAttribute("state", "collapsed");
					document.getElementById("resultsSplitterClassical").setAttribute("state", "collapsed");
					document.getElementById("resultsSplitterClassical").setAttribute("class", "cardbookVerticalSplitterClass");
				}
			}
		},

		setCheckboxes: function() {
			if (document.getElementById("cardboookModeBroadcaster").getAttribute("mode") == "cardbook") {
				document.getElementById("cardbookABPaneItem").hidden=false;
				document.getElementById("cardbookContactPaneItem").hidden=false;
				document.getElementById("menu_showFolderPane").hidden=true;
				document.getElementById("menu_showFolderPaneCols").hidden=true;
				document.getElementById("menu_showMessage").hidden=true;
				var prefs = Services.prefs;
				document.getElementById("cardbookABPaneItem").setAttribute('checked', prefs.getBoolPref("extensions.cardbook.viewABPane"));
				document.getElementById("cardbookContactPaneItem").setAttribute('checked', prefs.getBoolPref("extensions.cardbook.viewABContact"));
			} else {
				document.getElementById("cardbookABPaneItem").hidden=true;
				document.getElementById("cardbookContactPaneItem").hidden=true;
				document.getElementById("menu_showFolderPane").hidden=false;
				document.getElementById("menu_showFolderPaneCols").hidden=false;
				document.getElementById("menu_showMessage").hidden=false;
			}
		},

		setBoxes: function(aEvent) {
			aEvent.stopImmediatePropagation();
			var paneConfig = 0;
			var prefs = Services.prefs;
			var panesView = prefs.getComplexValue("extensions.cardbook.panesView", Components.interfaces.nsISupportsString).data;
			if (panesView == "modern") {
				var paneConfig = 2;
			} else if (panesView == "classical") {
				var paneConfig = 0;
			}
			var layoutStyleMenuitem = aEvent.target.childNodes[paneConfig];
			if (layoutStyleMenuitem) {
				layoutStyleMenuitem.setAttribute("checked", "true");
			}
		},

		changeOrientPanes: function(aValue) {
			var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
			if (aValue == "cmd_viewClassicMailLayout") {
				str.data = "classical";
			} else if (aValue == "cmd_viewVerticalMailLayout") {
				str.data = "modern";
			}
			var prefs = Services.prefs;
			prefs.setComplexValue("extensions.cardbook.panesView", Components.interfaces.nsISupportsString, str);
		},

		orientPanes: function() {
			if (document.getElementById("cardsBox") && document.getElementById("resultsSplitterModern") && document.getElementById("resultsSplitterClassical")) {
				var prefs = Services.prefs;
				var panesView = prefs.getComplexValue("extensions.cardbook.panesView", Components.interfaces.nsISupportsString).data;
				if (panesView == "modern") {
					document.getElementById("cardsBox").setAttribute("orient", "horizontal");
					document.getElementById("resultsSplitterModern").hidden=true;
					document.getElementById("resultsSplitterClassical").hidden=false;
				} else {
					document.getElementById("cardsBox").setAttribute("orient", "vertical");
					document.getElementById("resultsSplitterModern").hidden=false;
					document.getElementById("resultsSplitterClassical").hidden=true;
				}
			}
		}

	};
};

// for the displayed name of emails
// InitViewLayoutStyleMenu
(function() {
	// Keep a reference to the original function.
	var _original = InitViewLayoutStyleMenu;
	
	// Override a function.
	InitViewLayoutStyleMenu = function() {
		
		ovl_cardbookLayout.setCheckboxes();
		// Execute some action afterwards.
		if (document.getElementById("cardboookModeBroadcaster").getAttribute("mode") == "cardbook") {
			ovl_cardbookLayout.setBoxes(arguments[0]);
		} else {
			// Execute original function.
			_original.apply(null, arguments);
		}
	};

})();
