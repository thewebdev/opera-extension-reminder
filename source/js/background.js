/*  This file is part of The Reminder. The Reminder	is an 
	Opera extension that Displays notes in your Opera Speed 
	Dial to help you remember it.
	
    Copyright (C) 2012 M Shabeer Ali

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
	
	Website: http://getreminder.tumblr.com/
	Source code: https://github.com/thewebdev/opera-extension-reminder.git 
	Email: thewebdev@myopera.com 
*/
	
var slider; 
/* background colors */
var bg = ["#B80000", "#335300", "#003C5B", "#632561", "#72471F", 
          "#7E5949", "#547D48", "#4F487D", "#487A7D", "#7D4875"];

function $(v) {
	/* DOM: identifies element */
	if (document.getElementById(v)) {
		return document.getElementById(v);
	}
}

function E(v) {
	/* DOM: creates new element */
	return document.createElement(v);
}

function Txt(v) {
	/* DOM: creates text nodes */
	return document.createTextNode(v); 
}

function hide(id) {
	$(id).style.display = 'none';
}

function show(id) {
	$(id).style.display = 'block';
}

function createUl(kids) {
/*  Creates the unordered list used to
	display the data in the speed dial.
	The 'kids' parameter specifies how
	many list nodes  to create.	Once 
	the unordered list is created,
	the function only adds or deletes
	list node as necessary. Opera 
	recommends using createDocumentFragment()
	as it is faster to create the elements
	separately and then add to the page. */
	
	var ul, li, txt, temp;
	var inHtml = document.createDocumentFragment();
	var list = $("noteSlides");
	
	if (list) {
		/*  if ul node exists */
		
		temp = list.getElementsByTagName('li');
		
		if (temp.length === kids) {
			return;
		} else if (temp.length < kids) {
			/*  add more li nodes */
			
			var z = kids - temp.length;
			
			for (var a = 0; a < z; a++) {
				li = E('li');
				txt = Txt('');
				li.appendChild(txt);
				inHtml.appendChild(li);				
			}
			
			list.appendChild(inHtml);
			return;
			
		} else if (temp.length > kids) {
			/*  delete some li nodes */
			
			var x = temp.length - kids;
			
			while (x !== 0) {
				list.removeChild(temp[0]);
				x -= 1;
			}	
			return;
		}
	} 
	
	/*  create the list and add to the DOM */
		
	ul = E('ul');
	ul.setAttribute('id', 'noteSlides');
	
	for (var i = 0; i < kids; i++) {
		li = E('li');
		txt = Txt('');
		li.appendChild(txt);
		ul.appendChild(li);
	}

	inHtml.appendChild(ul);
	$('data').appendChild(inHtml);
	
	return;
}

function prepData() {
/*  Retrieves the saved notes and 
    prepares it for display */
	
	var i, x;
	var out = [];		
	
	refDial("wait");
	
	if (localStorage) {
		if (localStorage.length) {
			x = localStorage.length; 
			for (i = 0; i < x; i++) {
				key = localStorage.key(i);
				note = String(localStorage.getItem(key));				
				out[i] = note;
			}
		} else {
			/* load some default data */
			out[0] = "Smile";
			out[1] = "Stop browsing. Start working."
			out[2] = "Right-click. Select Preferences. Add notes."
		}
		
		/*  send the data for o/p */
		refDial("show", out);
	} else {
		refDial("hang");
	}
}

function refDial(cmd, out) {
	/* Show the updates and notes
	   in the speed dial. */
	
	if (cmd == "show") {
		var li, m, o;
		
		clearInterval(slider);	
		
		/* create the unordered list
		   structure used to show the data. */
		createUl(out.length);
		
		li = $("noteSlides").getElementsByTagName('li');
		m = out.length;
		
		for (o = 0; o < m; o++) {
			/*  add data */
			if (li[o]) {
				/*  reset css class */
				li[o].className = "";
				/*  assign the new data */
				li[o].innerHTML = out[o];
			} 		
		}
		
		li[0].className = 'current';
		
		hide("wait");
		show("data");
		
		/* each note is shown for a few seconds */
		slider = setInterval(startSlide, parseInt(widget.preferences.showfor,10) * 1000);
		
		/*  start displaying the data */
		startSlide();
		return;
	}
	
	if (cmd == "wait") {
		/* used to indicate that an
		   update of data is underway */
		
		$("msg").firstChild.nodeValue = "loading";

		clearInterval(slider);			
		hide("data");
		show("wait");
		
		return;
	}
	
	if (cmd == "hang") {
		/* indicate some error
		   has occured */
		
		$("msg").firstChild.nodeValue = "Something went wrong. Will retry after some time.";
		
		clearInterval(slider);	
		hide("data");
		show("wait");		
		
		return;
	} 
}

function startSlide() {
	/* Displays the notes.
	   Cycles through each list node
	   and marks the node to be displayed 
	   with css class name 'current'. */
	
	var cls, li, done, tempLi, m, s;
	
	done = false;
	tempLi = [];

	li = $("noteSlides").getElementsByTagName('li');
	m = li.length;
	
	for (var e=0; e < m; e++) {
		/* Opera recommends making changes 
		   to a copy of the DOM */
		tempLi[tempLi.length] = li[e];
	}
	
	s = tempLi.length;
	
	for (var i = 0; i < s; i++) {
		if (done) { 
			/* Once a list element has been marked
			   'current', no need to go through
			   the rest of it as we display only
			   one list element at a time. */
			
			continue; 
		}
		
		cls = tempLi[i].className;
		
		if ((cls.indexOf("current")) != -1) {
			
			/*  unmark the currently displayed li */
			tempLi[i].className = "";
			
			if (i == (tempLi.length-1)) {
				/* if we have reached the last 
				   li, mark the first li again. */
			
				tempLi[0].className = 'current';
			} else {
				tempLi[i+1].className = 'current';
			}
			
			done = true;
			if (i > bg.length) {
				document.body.style.backgroundColor = bg[0];			
			} else {
				document.body.style.backgroundColor = bg[i];			
			}
		}
	}
}

function init() {
	/* start */
	prepData();
}

/*  monitor and inform when HTML file is ready */
document.addEventListener('DOMContentLoaded', init, false);