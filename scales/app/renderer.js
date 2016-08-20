// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var _ = require('underscore');
var s11 = require('sharp11');
var audio = require('sharp11-web-audio');
var VF = require('vexflow').Flow;

var key = "C";
var root = s11.note.create(key).inOctave(4);
var notes = s11.scale.create(key).inOctave(4);

var modes = [
    "(I) {} major",
    "(ii) {} minor",
    "(iii) {} minor",
    "(IV) {} major",
    "(V) {} dominant",
    "(vi) {} minor",
    "(vii) {} half-diminished"
];

function scaleName(n) {
    return modes[(n-1) % modes.length].replace("{}", root.transpose('' + n).name);
}

drawScales = function(ele, k, start) {
    key = k;
    start = start || 1
    root = s11.note.create(key).inOctave(4);
    //notes = s11.scale.create(key).inOctave(4);

    // Create an SVG renderer and attach it to the DIV element named "staff".
    if (typeof(ele) === 'string') {
        ele = document.querySelector(ele);
    }
    ele.innerHTML="";
    var staff_height = 120;
    var staff_width = 600;
    var margin = 20;
    var width = staff_width + (margin * 2);
    var height = (staff_height * 7) + (margin * 2);
    var renderer = new VF.Renderer(ele, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);

    // Configure the rendering context.
    var context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    for (var i=0; i < 7; i++) {
      var n = i + Number(start);

      if (n > 7) {
        n -= 7;
      }

      var seq = [];
      for (var j=n; j<n+7; j++) { seq.push(root.transpose('' + j)); }

      if (i==0) {
        notes = seq;
      }

      // Create a stave 
      var stave = new VF.Stave(margin, margin+(i*staff_height), staff_width);

      // Add a clef and time signature.
      stave.addClef("treble"); //.addTimeSignature("4/4");
      
      if (key) {
        stave.addKeySignature(key);
      }

      // Add the scale name
      stave.setText(scaleName(n), VF.Modifier.Position.ABOVE, {justification: VF.TextNote.Justification.LEFT});
      //console.log(scaleName(n));

      // Connect it to the rendering context and draw!
      stave.setContext(context).draw();

      // Add scale
      var vnotes = [];

      for (var j=0; j < seq.length; j++) {
        //if (j == 4) {
        //    vnotes.push(new VF.BarNote(VF.Barline.SINGLE));
        //}

        var n = seq[j];
        var vn = n.name.toLowerCase() + '/' + n.octave;
        var sn = new VF.StaveNote({keys: [vn], duration: 'q'});
        if (n.acc != 'n') {
            sn.addAccidental(0, new VF.Accidental(n.acc));
        }

        vnotes.push(sn);
      }

      // Add chord
      vnotes.push(new VF.BarNote(VF.Barline.SINGLE));

      var vchord = [];
      var acc = [];

      for (var j=0; j < seq.length; j += 2) {
        var n = seq[j];
        var vn = n.name.toLowerCase() + '/' + n.octave;
        vchord.push(vn);
        acc.push(n.acc);
      }

      sn = new VF.StaveNote({keys: vchord, duration: 'q'});
      for (var j=0; j < acc.length; j++) {
        if (acc[j] != 'n') {
            sn.addAccidental(j, new VF.Accidental(acc[j]));
        }
      }

      vnotes.push(sn);

      var voice = new VF.Voice({num_beats: 8, beat_value: 4});
      voice.addTickables(vnotes);

      var formatter = new VF.Formatter();
      formatter.joinVoices([voice]).formatToStave([voice], stave);

      var beams = VF.Beam.generateBeams(vnotes);

      beams.forEach(function(beam) {
        beam.setContext(context).draw();
      });

      voice.draw(context, stave);
    }
}

playThing = function(t) {
    audio.init(function (err, fns) {
        if (err != undefined) {
            alert(err);
        } else {
            var n = Array.from(notes);
            var l = n.length;

            /*
            if (t != 0) {
                n = n.transposeDown("" + t);
            }
            */

            for (var i=0; i<l; i+=2) { n.push(n[i]); }

            if (t != 0) {
                n = n.map(function(v) { return v.transposeDown("" + t); });
            }

            console.log(n.toString());
            fns.arpeggiate(n, 0.5);
        }
    });
}
