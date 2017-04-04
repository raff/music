// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var s11 = require('sharp11');
// var audio = require('sharp11-web-audio');

var VF = require('vexflow').Flow;

var x = 20;
var y = 20;
var w = 180;
var lb = VF.Barline.type.SINGLE;
var ns = 0;

var vf = null;
var score = null;
var cw = 0;
var ch = 0;

initScore = function(sel) {
  cw = window.innerWidth - 60;
  ch = window.innerHeight;

  if (ch < 800) {
    ch = 800;
  }

  console.log(window.innerWidth);

  vf = new VF.Factory({
    renderer: {
        selector: sel,
        width: cw,
        height: ch
    }
  });

  score = vf.EasyScore();
}

function system() {
    ns += 1;

    if ((x + w) >= cw) { 
        console.log(x, w, cw);
        x = 20;
        y += 120;
        ns = 1;
    }

    var s = vf.System({x: x, y: y, width: w});
    x += w;
    return s;
}

drawStave = function(text, notes) {
  var stave = system().addStave({voices: [score.voice(score.notes(notes)).setStrict(false)]})
    .setText(text, VF.Modifier.Position.ABOVE, {justification: VF.TextNote.Justification.LEFT});

  if (ns == 1) {
    stave.setBegBarType(lb);
  } else if (ns == 4) {
    stave.setEndBarType(lb);
  }

  vf.draw();
}

addChord = function(ele) {
  var cname = ele.value;
  ele.value = '';

  if (! cname) {
    return;
  }

  var c = s11.chord.create(cname, 4);
  if (! c) {
    console.log("invalid chord name", cname);
    return;
  }

  cname = c.root.name + c.symbol;
  var snotes = c.chord.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
  console.log(cname, snotes);
  drawStave(cname, snotes);
}
