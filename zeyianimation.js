/**
 * jsPsych plugin for showing animations and recording keyboard responses
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 */

jsPsych.plugins.zeyi = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('zeyi', 'stimuli', 'image');

  plugin.info = {
    name: 'zeyi',
    description: '',
    parameters: {
      words: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'words',
        default: "",
        description: 'The HTML string to be displayed'
      },
      dot: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        description: 'The images to be displayed.'
      },
        dotsize: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Stimuli size',
          default: 0.01,
          description: 'dot size'
        },
      initialspeed: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'initial moving speed',
        default: 0,
        description: 'initial moving speed'
      },
        speed: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'base moving speed',
          default: 0.001,
          description: 'base moving speed.'
        },
      initialkey: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'initial moving direction',
        default: 999,
        description: 'initial moving direction.'
      },
      boundaryL: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'left boundary',
        default: 0.1,
        description: 'left boundary'
      },
      boundaryR: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'right boundary',
        default: 0.9,
        description: 'right boundary'
      },
      frame_time: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Frame time',
        default: 10,
        description: 'Duration to display each image.'
      },
      frame_isi: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Frame gap',
        default: 0,
        description: 'Length of gap to be shown between each image.'
      },
      sequence_reps: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Sequence repetitions',
        default: 1,
        description: 'Number of times to show entire sequence.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        array: true,
        description: 'Keys subject uses to respond to stimuli.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below stimulus.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight);
    var interval_time = trial.frame_time + trial.frame_isi;
    var animate_frame = -1;
    var reps = 0;
    var startTime = performance.now();
    var animation_sequence = [];
    var responses = [];
    var current_stim = "";
    var bL = trial.boundaryL * vw;
    var bR = trial.boundaryR * vw;
    var speed0 = trial.speed * vw;
    var speed = trial.initialspeed * vw;
    if (trial.initialkey == 999){
      trial.initialkey = trial.initialspeed/trial.speed;
    }
    var previouskey = trial.initialkey;
    var currentkey = 0;
    var dotsize = vw * trial.dotsize;
    var xpos = vh/2;
    var ypos = vw/2;
    var isend = 0;
    var islasttrial = 0;

    var animate_interval = setInterval(function() {
      var showImage = true;
      display_element.innerHTML = ''; // clear everything
      animate_frame++;
      if (isend == 1){
          endTrial();
          clearInterval(animate_interval);
          showImage = false;
      }
      if (showImage) {
        show_next_frame();
      }
    }, interval_time);

    function show_next_frame() {


      // show image
      display_element.innerHTML = '<canvas id="rect" width="'+vw.toString()+'" height="'+(vh*0.8).toString()+'">';//'</canvas><img src="'+trial.dot+'" id="zeyi" style="position:absolute; left: 0; top: 0;"></img>';
            var canvas = document.getElementById('rect');
            var context = canvas.getContext('2d');
            context.font = '30px Arial';
            context.textAlign = "center";
            var txt = trial.words;
            var lines = txt.split('\n');
            var lineheight = 0.05 * vh;
            for (var i = 0; i<lines.length; i++)
                context.fillText(lines[i],  vw/2, vh* 0.1 + (i*lineheight) );



            context.fillStyle = "#a8ee90";
            context.fillRect(0,xpos - vh * 0.2, vw, vh * 0.4);
            if (islasttrial == 1){
                context.fillStyle = "#000000"
                context.fillRect(bL-2*dotsize,xpos - vh * 0.2,2*dotsize,vh * 0.4);
                context.fillStyle = "#FF0000"
                context.fillRect(bR,xpos - vh * 0.2,2*dotsize,vh * 0.4);
            }
            if (islasttrial == -1){
                context.fillStyle = "#FF0000"
                context.fillRect(bL-2*dotsize,xpos - vh * 0.2,2*dotsize,vh * 0.4);
                context.fillStyle = "#000000"
                context.fillRect(bR,xpos - vh * 0.2,2*dotsize,vh * 0.4);
            }
            if (islasttrial == 0){
                context.fillStyle = "#000000"
                context.fillRect(bL-2*dotsize,xpos - vh * 0.2,2*dotsize,vh * 0.4);
                context.fillStyle = "#000000"
                context.fillRect(bR,xpos - vh * 0.2,2*dotsize,vh * 0.4);
            }
            context.arc(ypos, xpos, dotsize/2, 0, 2 * Math.PI, false);
            context.fillStyle = 'red';
            context.fill();
            // var theImg = document.getElementById('zeyi');
            // theImg.height = dotsize;
            // theImg.width = dotsize;
            // theImg.style.top = xpos - dotsize/2 + "px";
            // theImg.style.left = ypos - dotsize/2 + "px";
            // current_stim = trial.dot;
            if (islasttrial == 0){
                ypos = ypos + speed;
            }


                  // record when image was shown
            animation_sequence.push({
                mRT: performance.now() - startTime,
                mPos: ypos,
                mSpeed: speed,
                mKey: currentkey,
                mDir: previouskey
            });

            if (ypos - dotsize/2 < bL || ypos + dotsize/2 > bR) {
                if (ypos - dotsize/2 < bL){
                    islasttrial = -1;
                }
                if (ypos + dotsize/2 > bR){
                    islasttrial = 1;
                }
            }
      // display_element.innerHTML = '<img src="'+trial.bars+'" id="zeyibL" style="position:absolute; left: 0; top: 0;"></img><img src="'+trial.bars+'" id="zeyibR" style="position:absolute; left: 0; top: 0;"></img><img src="'+trial.dot+'" id="zeyi" style="position:absolute; left: 0; top: 0;"></img>';
      // var theImg = document.getElementById('zeyibL');
      // theImg.height = 100;
      // theImg.width = 20;
      // theImg.style.top = xpos - theImg.height/2 + "px";
      // theImg.style.left = bL + "px";
      // var theImg = document.getElementById('zeyibR');
      // theImg.height = 100;
      // theImg.width = 20;
      // theImg.style.top = xpos -  theImg.height/2 + "px";
      // theImg.style.left = bR + "px";


      // ypos = ypos + speed;
      // if (last(responses.key_press) == 102) {
      // }
      if (currentkey !== 0){
          if (currentkey == previouskey) {
              speed = speed;// + speed0 * currentkey;
          }
          if (currentkey !== previouskey) {
              speed = speed0 * currentkey;
          }
          previouskey = currentkey;
          currentkey = 0;
      }

      if (trial.prompt !== null) {
        display_element.innerHTML += trial.prompt;
      }

      // if (trial.frame_isi > 0) {
      //   jsPsych.pluginAPI.setTimeout(function() {
      //     display_element.querySelector('#zeyi').style.visibility = 'hidden';
      //     current_stim = 'blank';
      //     // record when blank image was shown
      //     animation_sequence.push({
      //       "stimulus": 'blank',
      //       "time": performance.now() - startTime
      //     });
      //   }, trial.frame_time);
      // }
    }

    var after_response = function(info) {
      responses.push({
        mKey: info.key,
        mRT: info.rt
        // stimulus: current_stim
      });
      if (info.key == trial.choices[0].codePointAt()){
          currentkey = -1;
          if (islasttrial == -1){
              isend = 1;
          }
      }
      if (info.key == trial.choices[1].codePointAt()){
          currentkey = 1;
          if (islasttrial == 1){
              isend = 1;
          }
      }

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#zeyi').className += ' responded';
    }

    // hold the jspsych response listener object in memory
    // so that we can turn off the response collection when
    // the trial ends
    var response_listener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'performance',
      persist: true,
      allow_held_key: false,
      choice: islasttrial
    });

    function endTrial() {

      jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

      var trial_data = {
        "x": vw,
        "y": vh,
        "bL": bL,
        "bR": bR,
        "dotsize": dotsize,
        "starttime": startTime,
        "basespeed": speed0,
        "speed0": trial.initialspeed,
        "init_direction": trial.initialkey,
        "time_frame": trial.frame_time,
        "time_ISI": trial.frame_isi,
        "responses": JSON.stringify(responses),
        "animation_sequence": JSON.stringify(animation_sequence),

      };

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
