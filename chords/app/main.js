document.addEventListener('DOMContentLoaded', () => {
  // do your setup here
  console.log('Initialized app');
});

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

var initScore = function(sel) {
  cw = window.innerWidth - 60;
  ch = window.innerHeight;

  if (ch < 800) {
    ch = 800;
  }

  console.log(window.innerWidth);

  vf = new VF.Factory({
    renderer: {
        elementId: sel,
        width: cw,
        height: ch
    }
  });

  score = vf.EasyScore();
}

function system(nl) {
    ns += 1;

    if ((x + w) >= cw || ns > 4) { 
        console.log(x, w, cw);
        x = 20;
        y += 120;
        ns = 1;
    }

    if (nl) {
        ns = 4
    }

    var s = vf.System({x: x, y: y, width: w});
    x += w;
    return s;
}

function drawStave(text, notes, nl, color) {
  var snotes = score.notes(notes);
  if (color && snotes.length == 7) {
    snotes[0].setStyle({fillStyle: "orange", strokeStyle: "orange"}); // ROOT
    snotes[2].setStyle({fillStyle: "red", strokeStyle: "red"}); // 3
    snotes[4].setStyle({fillStyle: "orange", strokeStyle: "orange"}); // 5
    snotes[6].setStyle({fillStyle: "red", strokeStyle: "red"}); // 7
  }
  var stave = system(nl).addStave({voices: [score.voice(snotes, {time: "8/4"}).setStrict(false)]})
    .setText(text, VF.Modifier.Position.ABOVE, {justification: VF.TextNote.Justification.LEFT});

  if (ns == 1) {
    stave.setBegBarType(lb);
    stave.setClef('treble')
  } else if (ns == 4) {
    stave.setEndBarType(lb);
  }

  vf.draw();
}

var changeOutputType = function(otype) {
    outputType = otype;
}

var addChord = function(inp, out) {
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
      if (c.bass !== null) {
        cname += '/' + c.bass.name
      }
      chordlist.push(cname)

      if (outputType === 'chord') {
        //
        // display chord
        //
        var snotes = c.chord.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");

        console.log('chord', outputType, cname, snotes);
        drawStave(cname, snotes, false);
      } else if (outputType === 'scale') {
        //
        // display scale
        //
        var snotes = c.scale().inOctave(octave).scale.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
        console.log('scale', outputType, cname, snotes);
        drawStave(cname, snotes, false, true);
      } else {
        // 
        // display chord and scale
        //
        var cnotes = c.chord.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
        var snotes = c.scale().inOctave(octave).scale.map(function(n, i) { return n.fullName + (i===0 ? '/8' : ''); }).join(",");
        console.log("scale", cname, snotes);
        drawStave(cname, snotes, false);
        console.log("chord", cname, cnotes);
        drawStave(cname, cnotes, true);
      }

      if (out) {
        out.innerText = chordlist.join(",")
      }
  });
}

var playNotes = function(t) {
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

export {
    initScore, changeOutputType, addChord, playNotes
}
