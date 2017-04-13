// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var s11 = require('sharp11');
var audio = require('sharp11-web-audio');

var VF = require('vexflow').Flow;

var x = 20;
var y = 20;
var w = 260; // 180;
var lb = VF.Barline.type.SINGLE;
var ns = 0;

var vf = null;
var score = null;
var cw = 0;
var ch = 0;

var octave = 4;
var outputType = 'chord';
var notelist = [];
var chordlist = [];

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

function drawStave(text, notes) {
  var stave = system().addStave({voices: [score.voice(score.notes(notes), {time: "8/4"}).setStrict(false)]})
    .setText(text, VF.Modifier.Position.ABOVE, {justification: VF.TextNote.Justification.LEFT});

  if (ns == 1) {
    stave.setBegBarType(lb);
    stave.setClef('treble')
  } else if (ns == 4) {
    stave.setEndBarType(lb);
  }

  vf.draw();
}

changeOutputType = function(otype) {
    outputType = otype;
}

addChord = function(inp, out) {
  var clist;

  if (typeof(inp)==='string') {
     clist = inp.trim();
  } else {
      clist = inp.value.trim();
      inp.value = '';
  }

  if (clist === '') {
    return;
  }

  clist.split(",").forEach(function(cname) {
      var c = s11.chord.create(cname, octave);
      if (! c) {
        console.log("invalid chord name", cname);
        return;
      }

      notelist = notelist.concat(c.chord);

      cname = c.root.name + c.symbol;
      if (c.bass) {
        cname += '/' + c.bass.fullName
      }
      chordlist.push(cname)

      var snotes;

      if (outputType === 'chord') {
        snotes = c.chord.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
      } else {
        snotes = c.scale().inOctave(octave).scale.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
      }

      console.log(outputType, cname, snotes);
      drawStave(cname, snotes);

      if (out) {
        out.innerText = chordlist.join(",")
      }
  });
}

playNotes = function(t) {
    audio.init(function (err, fns) {
        if (err != undefined) {
            alert(err);
        } else {
            var n = Array.from(notelist);
            if (t != 0) {
                n = n.map(function(v) { return v.transposeDown("" + t); });
            }

            console.log(n.toString());
            fns.arpeggiate(n, 0.5);
        }
    });
}
