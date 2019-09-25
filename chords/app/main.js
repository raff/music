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
var cnamelist = [];

var colors = {
    scale: "gray",
    chord: "orange",
    lead: "red",
    color: "purple"
    };

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
  if (color) {
    if (outputType == "scale") {
        snotes.forEach(function(n, i) {
            if (i == 2 || i == 6) {
                n.setStyle({fillStyle: colors.lead, strokeStyle: colors.lead}); // lead tone (3, 7)
            } else if (i % 2 == 0) {
                if (i < 7) {
                    n.setStyle({fillStyle: colors.chord, strokeStyle: colors.chord}); // chord tone (1, 5)
                } else {
                    n.setStyle({fillStyle: colors.color, strokeStyle: colors.color}); // color tone (9, 11...)
                }
            } else {
                n.setStyle({fillStyle: colors.scale, strokeStyle: colors.scale}); // scale tone
            }
        });
    } else {
        snotes.forEach(function(n, i) {
            if (i == 1 || i == 3) {
                n.setStyle({fillStyle: colors.lead, strokeStyle: colors.lead}); // lead tone (3, 7)
            } else if (i < 4) {
                    n.setStyle({fillStyle: colors.chord, strokeStyle: colors.chord}); // chord tone (1, 5)
            } else {
                n.setStyle({fillStyle: colors.color, strokeStyle: colors.color}); // color tone (9, 11...)
            }
	});
    }
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

  clist.split(/[, ]/).forEach(function(cname) {
      cname = cname.trim();
      if (cname == "") {
        return;
      }
      if (cname == '%') {
        var l = chordlist.length;
        if (l > 0) {
          cname = chordlist[l-1];
        }
      }
      var c = s11.chord.create(cname, octave);
      if (! c) {
        console.log("invalid chord name", cname);
        return;
      }

      notelist = notelist.concat(c.chord);
      chordlist.push(c);

      cname = c.root.name + c.symbol;
      if (c.bass !== null) {
        cname += '/' + c.bass.name
      }
      cnamelist.push(cname)

      if (outputType === 'chord') {
        //
        // display chord
        //
        var snotes = c.chord.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");

        console.log('chord', cname, snotes);
        drawStave(cname, snotes, false, true);
      } else if (outputType === 'scale') {
        //
        // display scale
        //
        var snotes = c.scale().inOctave(octave).scale.map(function(n, i) { return n.fullName + (i===0 ? '/q' : ''); }).join(",");
        console.log('scale', cname, snotes);
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
        out.innerText = cnamelist.join(",")
      }
  });
}

var playNotes = function(tr, play) {
    audio.init(function (err, fns) {
        fns.stop();

        if (err != undefined) {
            alert(err);
        } else {
            var n = Array.from(notelist);
            var d = 0.5;
            if (play == "ltone") { // play 3rd and 7th of (1, 3, 5, 7)
                n = n.filter(function(v,i) { return i % 2; });
                d = 1.0;
            }
            if (tr != 0) {
                n = n.map(function(v) { return v.transposeDown("" + tr); });
            }

	    if (play == "chord") {
                d = 1.0;

                chordlist.forEach(function (c, i) {
                    console.log("play", c.toString());
                    fns.play(c.chord, i * d, d);
                });
	    } else {
            	console.log("play", n.toString());
                fns.arpeggiate(n, 0, d);
	    }
        }
    });
}

export {
    initScore, changeOutputType, addChord, playNotes
}
