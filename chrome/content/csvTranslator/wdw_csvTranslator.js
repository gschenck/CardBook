if ("undefined" == typeof(wdw_csvTranslator)) {
	Components.utils.import("resource://gre/modules/Services.jsm");
	Components.utils.import("chrome://cardbook/content/cardbookRepository.js");

	var wdw_csvTranslator = {

		cardbookeditlists : {},
		blankColumn : "",
		nIntervId : "",

		getTemplate: function (aFieldList) {
			var myFieldArray = aFieldList.split('|');
			var result = [];
			for (var i = 0; i < myFieldArray.length; i++) {
				result.push([myFieldArray[i], wdw_csvTranslator.getTranslatedField(myFieldArray[i])]);
			}
			return result;
		},

		translateFields: function (aFieldList) {
			var myFieldArray = aFieldList.split('|');
			var result = [];
			for (var i = 0; i < myFieldArray.length; i++) {
				result.push(wdw_csvTranslator.getTranslatedField(myFieldArray[i]));
			}
			return cardbookUtils.cleanArray(result).join('|');
		},

		getTranslatedField: function (aField, aLocale) {
			if (aLocale != null && aLocale !== undefined && aLocale != "") {
				var strBundle = Services.strings.createBundle("resource://" + aLocale + "/cardbook.properties");
			} else {
				var strBundle = Services.strings.createBundle("chrome://cardbook/locale/cardbook.properties");
			}
			for (var i in cardbookRepository.allColumns) {
				for (var j = 0; j < cardbookRepository.allColumns[i].length; j++) {
					if (i != "arrayColumns" && i != "categories") {
						if (cardbookRepository.allColumns[i][j] == aField) {
							return strBundle.GetStringFromName(cardbookRepository.allColumns[i][j] + "Label");
						}
					} else if (i == "categories") {
						if (cardbookRepository.allColumns[i][j] + ".0.array" == aField) {
							return strBundle.GetStringFromName(cardbookRepository.allColumns[i][j] + "Label");
						}
					}
				}
			}
			for (var i in cardbookRepository.customFields) {
				for (var j = 0; j < cardbookRepository.customFields[i].length; j++) {
					if (cardbookRepository.customFields[i][j][0] == aField) {
						return cardbookRepository.customFields[i][j][1];
					}
				}
			}
			for (var i = 0; i < cardbookRepository.allColumns.arrayColumns.length; i++) {
				for (var k = 0; k < cardbookRepository.allColumns.arrayColumns[i][1].length; k++) {
					if (cardbookRepository.allColumns.arrayColumns[i][0] + "." + k + ".all" == aField) {
						return strBundle.GetStringFromName(cardbookRepository.allColumns.arrayColumns[i][1][k] + "Label");
					} else if (cardbookRepository.allColumns.arrayColumns[i][0] + "." + k + ".notype" == aField) {
						return strBundle.GetStringFromName(cardbookRepository.allColumns.arrayColumns[i][1][k] + "Label") + " (" + strBundle.GetStringFromName("importNoTypeLabel") + ")";
					}
				}
			}
			for (var i = 0; i < cardbookRepository.allColumns.arrayColumns.length; i++) {
				var myPrefTypes = cardbookPreferences.getAllTypesByType(cardbookRepository.allColumns.arrayColumns[i][0]);
				for (var j = 0; j < myPrefTypes.length; j++) {
					for (var k = 0; k < cardbookRepository.allColumns.arrayColumns[i][1].length; k++) {
						if (cardbookRepository.allColumns.arrayColumns[i][0] + "." + k + "." + myPrefTypes[j][0] == aField) {
							return strBundle.GetStringFromName(cardbookRepository.allColumns.arrayColumns[i][1][k] + "Label") + " (" + myPrefTypes[j][1] + ")";
						}
					}
				}
			}
			if ("blank" == aField) {
				return strBundle.GetStringFromName(window.arguments[0].mode + "blankColumn");
			}
			return "";
		},

		getSelectedLines: function (aTreeName) {
			var myTree = document.getElementById(aTreeName + 'Tree');
			var listOfSelected = {};
			var numRanges = myTree.view.selection.getRangeCount();
			var start = new Object();
			var end = new Object();
			var count = 0;
			for (var i = 0; i < numRanges; i++) {
				myTree.view.selection.getRangeAt(i,start,end);
				for (var j = start.value; j <= end.value; j++){
					listOfSelected[j] = true;
					count++;
				}
			}
			return {lines: listOfSelected, total: count};
		},

		upColumns: function () {
			var myTreeName = "addedColumns";
			var myTree = document.getElementById(myTreeName + 'Tree');
			var listOfSelected = {};
			listOfSelected = wdw_csvTranslator.getSelectedLines(myTreeName);
			var first = true;
			var found = false;
			for (var i = 0; i < wdw_csvTranslator.cardbookeditlists[myTreeName].length; i++) {
				if (listOfSelected.lines[i]) {
					if (!first) {
						var temp = wdw_csvTranslator.cardbookeditlists[myTreeName][i-1];
						wdw_csvTranslator.cardbookeditlists[myTreeName][i-1] = wdw_csvTranslator.cardbookeditlists[myTreeName][i];
						wdw_csvTranslator.cardbookeditlists[myTreeName][i] = temp;
						found = true;
					}
				} else {
					first = false;
				}
			}
			wdw_csvTranslator.displayListTrees(myTreeName);
			for (var i = 0; i < wdw_csvTranslator.cardbookeditlists[myTreeName].length; i++) {
				if (!found && listOfSelected.lines[i]) {
					myTree.view.selection.rangedSelect(i,i,true);
				} else {
					if (listOfSelected.lines[i] && i == 0) {
						myTree.view.selection.rangedSelect(i,i,true);
					} else if (listOfSelected.lines[i]) {
						myTree.view.selection.rangedSelect(i-1,i-1,true);
					}
				}
			}
		},

		downColumns: function () {
			var myTreeName = "addedColumns";
			var myTree = document.getElementById(myTreeName + 'Tree');
			var listOfSelected = {};
			listOfSelected = wdw_csvTranslator.getSelectedLines(myTreeName);
			var first = true;
			var found = false;
			for (var i = wdw_csvTranslator.cardbookeditlists[myTreeName].length-1; i >= 0; i--) {
				if (listOfSelected.lines[i]) {
					if (!first) {
						var temp = wdw_csvTranslator.cardbookeditlists[myTreeName][i+1];
						wdw_csvTranslator.cardbookeditlists[myTreeName][i+1] = wdw_csvTranslator.cardbookeditlists[myTreeName][i];
						wdw_csvTranslator.cardbookeditlists[myTreeName][i] = temp;
						found = true;
					}
				} else {
					first = false;
				}
			}
			wdw_csvTranslator.displayListTrees(myTreeName);
			for (var i = 0; i < wdw_csvTranslator.cardbookeditlists[myTreeName].length; i++) {
				if (!found && listOfSelected.lines[i]) {
					myTree.view.selection.rangedSelect(i,i,true);
				} else {
					if (listOfSelected.lines[i] && i == wdw_csvTranslator.cardbookeditlists[myTreeName].length-1) {
						myTree.view.selection.rangedSelect(i,i,true);
					} else if (listOfSelected.lines[i]) {
						myTree.view.selection.rangedSelect(i+1,i+1,true);
					}
				}
			}
		},

		displayListTrees: function (aTreeName) {
			var availableCardsTreeView = {
				get rowCount() { return wdw_csvTranslator.cardbookeditlists[aTreeName].length; },
				isContainer: function(idx) { return false },
				canDrop: function(idx) { return (aTreeName == "addedColumns") },
				cycleHeader: function(idx) { return false },
				isEditable: function(idx, column) { return false },
				getCellText: function(idx, column) {
					if (column.id == aTreeName + "Id") {
						if (wdw_csvTranslator.cardbookeditlists[aTreeName][idx]) return wdw_csvTranslator.cardbookeditlists[aTreeName][idx][0];
					}
					else if (column.id == aTreeName + "Name") {
						if (wdw_csvTranslator.cardbookeditlists[aTreeName][idx]) return wdw_csvTranslator.cardbookeditlists[aTreeName][idx][1];
					}
				}
			}
			document.getElementById(aTreeName + 'Tree').view = availableCardsTreeView;
		},

		modifyLists: function (aMenuOrTree) {
			switch (aMenuOrTree.id) {
				case "availableColumnsTreeChildren":
					var myAction = "appendlistavailableColumnsTree";
					break;
				case "addedColumnsTreeChildren":
					var myAction = "deletelistaddedColumnsTree";
					break;
				default:
					var myAction = aMenuOrTree.id.replace("Button", "");
					break;
			}
			var myAvailableColumnsTree = document.getElementById('availableColumnsTree');
			var myAddedColumnsTree = document.getElementById('addedColumnsTree');
			var myAvailableColumns = cardbookUtils.getSelectedColumnsForList(myAvailableColumnsTree);
			var myAddedColumns = cardbookUtils.getSelectedColumnsForList(myAddedColumnsTree);
			switch (myAction) {
				case "appendlistavailableColumnsTree":
					for (var i = 0; i < myAvailableColumns.length; i++) {
						wdw_csvTranslator.cardbookeditlists.addedColumns.push([myAvailableColumns[i][0], myAvailableColumns[i][1]]);
					}
					break;
				case "deletelistaddedColumnsTree":
					for (var i = myAddedColumns.length-1; i >= 0; i--) {
						wdw_csvTranslator.cardbookeditlists.addedColumns.splice(myAddedColumns[i][2], 1);
					}
					break;
				default:
					break;
			}
			wdw_csvTranslator.displayListTrees("addedColumns");
		},

		validateImportColumns: function () {
			if (wdw_csvTranslator.cardbookeditlists.foundColumns.length != wdw_csvTranslator.cardbookeditlists.addedColumns.length) {
				var strBundle = document.getElementById("cardbook-strings");
				var confirmTitle = strBundle.getString("confirmTitle");
				var confirmMsg = strBundle.getString("missingColumnsConfirmMessage");
				if (!Services.prompt.confirm(window, confirmTitle, confirmMsg)) {
					return false;
				}
				var missing = wdw_csvTranslator.cardbookeditlists.foundColumns.length - wdw_csvTranslator.cardbookeditlists.addedColumns.length;
				for (var i = 0; i < missing; i++) {
					wdw_csvTranslator.cardbookeditlists.addedColumns.push(["blank", wdw_csvTranslator.blankColumn]);
				}
				var more = wdw_csvTranslator.cardbookeditlists.addedColumns.length - wdw_csvTranslator.cardbookeditlists.foundColumns.length;
				for (var i = 0; i < more; i++) {
					wdw_csvTranslator.cardbookeditlists.addedColumns.slice(wdw_csvTranslator.cardbookeditlists.addedColumns.length, 1);
				}
			}
			return true;
		},

		loadFoundColumns: function () {
			wdw_csvTranslator.cardbookeditlists.foundColumns = [];
			var mySep = document.getElementById('fieldDelimiterTextBox').value;
			if (mySep == "") {
				mySep = ";";
			}
			var myTempArray = window.arguments[0].headers.split(mySep);
			for (var i = 0; i < myTempArray.length; i++) {
				wdw_csvTranslator.cardbookeditlists.foundColumns.push([i, myTempArray[i]]);
			}
			wdw_csvTranslator.displayListTrees("foundColumns");
		},

		startDrag: function (aEvent, aTreeChildren) {
			try {
				var listOfUid = [];
				if (aTreeChildren.id == "availableColumnsTreeChildren") {
					var myTree = document.getElementById('availableColumnsTree');
				} else if (aTreeChildren.id == "addedColumnsTreeChildren") {
					var myTree = document.getElementById('addedColumnsTree');
				} else {
					return;
				}
				var numRanges = myTree.view.selection.getRangeCount();
				var start = new Object();
				var end = new Object();
				for (var i = 0; i < numRanges; i++) {
					myTree.view.selection.getRangeAt(i,start,end);
					for (var j = start.value; j <= end.value; j++){
						var myId = myTree.view.getCellText(j, {id: myTree.id.replace("Tree", "") + "Id"});
						listOfUid.push(j+"::"+myId);
					}
				}
				aEvent.dataTransfer.setData("text/plain", myTree.id+"::"+listOfUid.join("@@@@@"));
			}
			catch (e) {
				wdw_cardbooklog.updateStatusProgressInformation("wdw_csvTranslator.startDrag error : " + e, "Error");
			}
		},

		dragCards: function (aEvent) {
			var myTree = document.getElementById('addedColumnsTree');
			var myTarget = myTree.treeBoxObject.getRowAt(aEvent.clientX, aEvent.clientY);

			var myData = aEvent.dataTransfer.getData("text/plain");
			var localDelim1 = myData.indexOf("::",0);
			var myTreeSource = myData.substr(0,localDelim1);
			var myColumns = myData.substr(localDelim1+2,myData.length).split("@@@@@");

			if (myTreeSource == "addedColumnsTree") {
				for (var i = myColumns.length-1; i >= 0; i--) {
					var myTempArray = myColumns[i].split("::");
					var myIndex = myTempArray[0];
					wdw_csvTranslator.cardbookeditlists.addedColumns.splice(myIndex,1);
				}
			}
				
			for (var i = 0; i < myColumns.length; i++) {
				var myTempArray = myColumns[i].split("::");
				var myValue = myTempArray[1];
				wdw_csvTranslator.cardbookeditlists.addedColumns.splice(myTarget, 0, [myValue, wdw_csvTranslator.getTranslatedField(myValue)]);
				myTarget++;
			}
			wdw_csvTranslator.displayListTrees("addedColumns");
		},

		windowControlShowing: function () {
			var myTreeName = "addedColumns";
			var listOfSelected = {};
			listOfSelected = wdw_csvTranslator.getSelectedLines("addedColumns");
			if (listOfSelected.total > 0) {
				document.getElementById('upAddedColumnsTreeButton').disabled = false;
				document.getElementById('downAddedColumnsTreeButton').disabled = false;
			} else {
				document.getElementById('upAddedColumnsTreeButton').disabled = true;
				document.getElementById('downAddedColumnsTreeButton').disabled = true;
			}
		},

		setSyncControl: function () {
			wdw_csvTranslator.nIntervId = setInterval(wdw_csvTranslator.windowControlShowing, 500);
		},

		clearSyncControl: function () {
			clearInterval(wdw_csvTranslator.nIntervId);
		},

		guess: function () {
			var oneFound = false;
			var result = [];
			// search with current locale
			for (var i = 0; i < wdw_csvTranslator.cardbookeditlists.foundColumns.length; i++) {
				var myFoundColumn = wdw_csvTranslator.cardbookeditlists.foundColumns[i][1].replace(/^\"|\"$/g, "").replace(/^\'|\'$/g, "");
				var found = false;
				for (var j = 0; j < wdw_csvTranslator.cardbookeditlists.availableColumns.length; j++) {
					if (wdw_csvTranslator.cardbookeditlists.availableColumns[j][1].toLowerCase() == myFoundColumn.toLowerCase()) {
						result.push([wdw_csvTranslator.cardbookeditlists.availableColumns[j][0], wdw_csvTranslator.cardbookeditlists.availableColumns[j][1]]);
						found = true;
						oneFound = true;
						break;
					}
				}
				if (!found) {
					result.push(["blank", wdw_csvTranslator.blankColumn]);
				}
			}
			if (!oneFound) {
				result = [];
				// search with en-US locale
				for (var i = 0; i < wdw_csvTranslator.cardbookeditlists.foundColumns.length; i++) {
					var myFoundColumn = wdw_csvTranslator.cardbookeditlists.foundColumns[i][1].replace(/^\"|\"$/g, "").replace(/^\'|\'$/g, "");
					var found = false;
					for (var j = 0; j < wdw_csvTranslator.cardbookeditlists.availableColumns.length; j++) {
						var myTranslatedColumn = wdw_csvTranslator.getTranslatedField(wdw_csvTranslator.cardbookeditlists.availableColumns[j][0], "cardbook-locale-US");
						if (myTranslatedColumn.toLowerCase() == myFoundColumn.toLowerCase()) {
							result.push([wdw_csvTranslator.cardbookeditlists.availableColumns[j][0], wdw_csvTranslator.cardbookeditlists.availableColumns[j][1]]);
							found = true;
							oneFound = true;
							break;
						}
					}
					if (!found) {
						result.push(["blank", wdw_csvTranslator.blankColumn]);
					}
				}
			}
			if (oneFound) {
				wdw_csvTranslator.cardbookeditlists.addedColumns = result;
				wdw_csvTranslator.displayListTrees("addedColumns");
			}
		},

		load: function () {
			wdw_csvTranslator.setSyncControl();

			var strBundle = document.getElementById("cardbook-strings");
			document.title = strBundle.getString(window.arguments[0].mode + "MappingTitle");
			document.getElementById('availableColumnsGroupboxLabel').label = strBundle.getString(window.arguments[0].mode + "availableColumnsGroupboxLabel");
			document.getElementById('addedColumnsGroupboxLabel').label = strBundle.getString(window.arguments[0].mode + "addedColumnsGroupboxLabel");
			
			wdw_csvTranslator.cardbookeditlists.availableColumns = [];
			wdw_csvTranslator.cardbookeditlists.addedColumns = [];
			
			if (window.arguments[0].mode == "choice") {
				document.getElementById('foundColumnsVBox').hidden = true;
				document.getElementById('lineHeaderLabel').hidden = true;
				document.getElementById('lineHeaderCheckBox').hidden = true;
				document.getElementById('lineHeaderCheckBox').hidden = true;
				document.getElementById('fieldDelimiterLabel').hidden = true;
				document.getElementById('fieldDelimiterTextBox').hidden = true;
				document.getElementById('saveTemplateLabel').hidden = true;
				document.getElementById('loadTemplateLabel').hidden = true;
				document.getElementById('guesslistavailableColumnsTreeButton').hidden = true;
			} else if (window.arguments[0].mode == "export") {
				document.getElementById('foundColumnsVBox').hidden = true;
				document.getElementById('lineHeaderLabel').hidden = true;
				document.getElementById('lineHeaderCheckBox').hidden = true;
				document.getElementById('fieldDelimiterLabel').value = strBundle.getString("fieldDelimiterLabel");
				document.getElementById('fieldDelimiterTextBox').value = window.arguments[0].columnSeparator;
				document.getElementById('guesslistavailableColumnsTreeButton').hidden = true;
			} else if (window.arguments[0].mode == "import") {
				document.getElementById('foundColumnsGroupboxLabel').label = strBundle.getString(window.arguments[0].mode + "foundColumnsGroupboxLabel");
				document.getElementById('lineHeaderLabel').value = strBundle.getString("lineHeaderLabel");
				document.getElementById('lineHeaderCheckBox').setAttribute('checked', true);
				document.getElementById('fieldDelimiterLabel').value = strBundle.getString("fieldDelimiterLabel");
				document.getElementById('fieldDelimiterTextBox').value = window.arguments[0].columnSeparator;
				wdw_csvTranslator.blankColumn = strBundle.getString(window.arguments[0].mode + "blankColumn");
				wdw_csvTranslator.cardbookeditlists.availableColumns.push(["blank", wdw_csvTranslator.blankColumn]);
			}
			
			wdw_csvTranslator.cardbookeditlists.addedColumns = window.arguments[0].template;
			wdw_csvTranslator.displayListTrees("addedColumns");

			wdw_csvTranslator.cardbookeditlists.availableColumns = wdw_csvTranslator.cardbookeditlists.availableColumns.concat(cardbookUtils.getAllAvailableColumns(window.arguments[0].mode));
			wdw_csvTranslator.displayListTrees("availableColumns");

			if (window.arguments[0].mode == "import") {
				wdw_csvTranslator.loadFoundColumns();
			}

		},

		save: function () {
			window.arguments[0].template = wdw_csvTranslator.cardbookeditlists.addedColumns;
			window.arguments[0].columnSeparator = document.getElementById('fieldDelimiterTextBox').value;
			window.arguments[0].lineHeader = document.getElementById('lineHeaderCheckBox').checked;
			if (window.arguments[0].columnSeparator == "") {
				window.arguments[0].columnSeparator = ";";
			}
			window.arguments[0].action = "SAVE";
			if (window.arguments[0].mode == "import") {
				if (!wdw_csvTranslator.validateImportColumns()) {
					return;
				}
			}
			wdw_csvTranslator.close();
		},

		loadTemplate: function () {
			cardbookUtils.callFilePicker("fileSelectionTPLTitle", "OPEN", "TPL", "", wdw_csvTranslator.loadTemplateNext);
		},

		loadTemplateNext: function (aFile) {
			try {
				if (aFile != null && aFile !== undefined && aFile != "") {
					cardbookSynchronization.getFileDataAsync(aFile.path, wdw_csvTranslator.loadTemplateNext2, {});
				}
			}
			catch (e) {
				wdw_cardbooklog.updateStatusProgressInformation("wdw_csvTranslator.loadTemplateNext error : " + e, "Error");
			}
		},

		loadTemplateNext2: function (aContent, aParams) {
			try {
				if (aContent != null && aContent !== undefined && aContent != "") {
					wdw_csvTranslator.cardbookeditlists.addedColumns = wdw_csvTranslator.getTemplate(aContent);
					wdw_csvTranslator.displayListTrees("addedColumns");
				}
			}
			catch (e) {
				wdw_cardbooklog.updateStatusProgressInformation("wdw_csvTranslator.loadTemplateNext2 error : " + e, "Error");
			}
		},

		saveTemplate: function () {
			cardbookUtils.callFilePicker("fileCreationTPLTitle", "SAVE", "TPL", "", wdw_csvTranslator.saveTemplateNext);
		},

		saveTemplateNext: function (aFile) {
			try {
				if (!(aFile.exists())) {
					aFile.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
				}

				var result = [];
				for (var i = 0; i < wdw_csvTranslator.cardbookeditlists.addedColumns.length; i++) {
					result.push(wdw_csvTranslator.cardbookeditlists.addedColumns[i][0]);
				}

				cardbookSynchronization.writeContentToFile(aFile.path, result.join('|'), "UTF8");
			}
			catch (e) {
				wdw_cardbooklog.updateStatusProgressInformation("wdw_csvTranslator.saveTemplateNext error : " + e, "Error");
			}
		},

		cancel: function () {
			window.arguments[0].action = "CANCEL";
			wdw_csvTranslator.close();
		},

		close: function () {
			wdw_csvTranslator.clearSyncControl();
			close();
		}

	};

};
