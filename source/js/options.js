var stack = {};
var count;

function $(v) {
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}

function E(v) {
	return document.createElement(v);
}

function Txt(v) {
	return document.createTextNode(v);
}	

function submit() {
	if (document.input.remind.value) {
		addNote();
	}
	return false;
}
function status(msg) {
	/* Used to display messages
	   to the user */
	   
	var hangTimer;
	
	$("msg").firstChild.nodeValue = msg;
	show("msg");
	
	/* show status update for 7 seconds */
	clearTimeout(hangTimer);
	hangTimer = setTimeout(function() {
		hide("msg");
	}, 7000);	
}

function unlock() {
	/* Enable save button but not if
	   there is no notes to be saved 
	   (indicated by count). */
	   
	if (count === 0) {
		$('apply').disabled = true;
	} else {
		$('apply').disabled = false;
	}
}

function genId() {
	/* 
	   original source - 
	   http://www.mediacollege.com/internet/javascript/number/random.html
	*/
	var chars = "abcdefghiklmnopqrstuvwxyz";
	var idSize = 8;
	var id = '';
	
	for (var i = 0; i < idSize; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		id += chars.substring(rnum,rnum+1);
	}
	
	return id;
}

function apply() {
	/* Saves the changes permanently */
	   
	var cmd, note;
	var ul, li;
	var save = false;
	
	for (var id in stack) {
		if (stack[id][0] == 'add'){
			note = stack[id][1];
			if (localStorage) {
				localStorage.setItem(id, note)
				save = true;
			} else {
				status("Error: Unable to save note.");
			}
		}
		
		if (stack[id][0] == 'remove') {
			if (localStorage.getItem(id)) {
				localStorage.removeItem(id)
			}
			save = true;
		}
	}
	
	/* reset stack */
	stack = {};
	
	hide("set");
	ul = $("set");
	li = ul.getElementsByTagName("li");
	
	/* remove class name to flag that
	   new notes have been saved */
	   
	for (var e = 0; e < li.length; e++) {
		li[e].className = "";
	}
	
	show("set");
	
	if (save) {
		widget.preferences.count = count;
		/* reload dial with new settings */		
		opera.extension.bgProcess.prepData();		
	}
	
	$('apply').disabled = true;	
	return;
}

function removeNote() {
	/* Allows user to delete a note. Note:
	   The notes are not deleted immediately */
	   
	var id, li;
	var temp;
	
	id = this.parentNode.id;
	
	li = $(id);

	/* makes sure we don't delete a note
	   that doesn't exist in localStorage */
	
	if (li.className == 'new') {
		/* delete from stack only */
		delete stack[id];
	} else {
		/* mark for deletion */
		stack[id] = ['remove'];
	}
	
	count = count - 1;

	/* Validation: there should be atleast one
       note for the extension to function */
	   
	if (count == 0) {
		$('apply').disabled = true;
	} else {
		$('apply').disabled = false;
	}
	
	li.parentNode.removeChild(li);
}

function addNote() {
	/* Allows the user to add new 
	   notes and displays it. */
	   
	var key, note;
	var li, id, a, txt;
	
	note = document.input.remind.value;
	
	id = genId();
	
	li = E("li");
	li.setAttribute('id', id);
	li.className = "new";
	
	a = E("a");
	a.setAttribute('href', '#self');
	txt = Txt('delete');
	a.appendChild(txt);
	a.addEventListener('click', removeNote, false);
	
	txt = Txt(note);
	
	li.appendChild(a);
	li.appendChild(txt);
	
	stack[id] = ["add", note];
	
	count += 1;
		
	$("set").appendChild(li);
	
	/* Enable the save button as
	   user made changes. */
	$('apply').disabled = false;
	
	return;
}

function load() {
	/* Loads the saved notes and displays 
	   it to the user for making changes. */ 
	   
	var key, note;
	
	var ul, li, a, txt;
	var inHtml = document.createDocumentFragment();

	hide("set");
	
	/* Creates a ul list to display 
	   the saved notes */
	   
	if (localStorage) {
		if (localStorage.length) {
			x = localStorage.length; 
			for (i = 0; i < x; i++) {
				key = localStorage.key(i);
				note = String(localStorage.getItem(key));
				
				li = E("li");
				li.setAttribute('id', key);
				
				a = E("a");
				a.setAttribute('href', '#self' + i);
				txt = Txt('delete');
				a.appendChild(txt);
				a.addEventListener('click', removeNote, false);

				txt = Txt(note);				
				li.appendChild(a);
				li.appendChild(txt);
				
				inHtml.appendChild(li);
			}
			
		$("set").appendChild(inHtml);			
		}	   
	}
	show("set");
}

function init() {
	/* some basic settings intialised here */
	
	count = widget.preferences.count;
	
	/* disable save button on start */
	$('apply').disabled = true;
	
	/* monitor for button clicks */
	$('add').addEventListener('click', addNote, false); 
	$('apply').addEventListener('click', apply, false);
	$('input').addEventListener('submit', submit, false);
	
	load();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);