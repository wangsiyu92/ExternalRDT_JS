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
      dot: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        description: 'The images to be displayed.'
      },
      speed: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'initial moving speed',
        default: 0.001,
        description: 'initial moving speed.'
      },
      initialkey: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'initial moving direction',
        default: 1,
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
    var xpos = vh/2;
    var ypos = vw/2;
    var bL = trial.boundaryL * vw;
    var bR = trial.boundaryR * vw;
    var speed0 = trial.speed * vw;
    var previouskey = trial.initialkey;
    var speed = speed0 * previouskey;
    var currentkey = 0;

    var animate_interval = setInterval(function() {
      var showImage = true;
      display_element.innerHTML = ''; // clear everything
      animate_frame++;
      if (ypos < bL || ypos > bR) {
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
      display_element.innerHTML = '<img src="'+trial.dot+'" id="zeyibL" style="position:absolute; left: 0; top: 0;"></img><img src="'+trial.dot+'" id="zeyibR" style="position:absolute; left: 0; top: 0;"></img><img src="'+trial.dot+'" id="zeyi" style="position:absolute; left: 0; top: 0;"></img>';
      var theImg = document.getElementById('zeyibL');
      theImg.height = 100;
      theImg.width = 20;
      theImg.style.top = xpos + "px";
      theImg.style.left = bL + "px";
      var theImg = document.getElementById('zeyibR');
      theImg.height = 100;
      theImg.width = 20;
      theImg.style.top = xpos + "px";
      theImg.style.left = bR + "px";
      var theImg = document.getElementById('zeyi');
      theImg.height = 20;
      theImg.width = 20;
      theImg.style.top = xpos + "px";
      theImg.style.left = ypos + "px";
      current_stim = trial.dot;
      // ypos = ypos + speed;
      // if (last(responses.key_press) == 102) {
      // }
      ypos = ypos + speed;
      if (currentkey !== 0){
          if (currentkey == previouskey) {
              speed = speed + speed0 * currentkey;
          }
          if (currentkey !== previouskey) {
              speed = speed0 * currentkey;
          }
          previouskey = currentkey;
          currentkey = 0;
      }

      // record when image was shown
      animation_sequence.push({
        "stimulus": trial.dot,
        "time": performance.now() - startTime
      });

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
        key_press: info.key,
        rt: info.rt,
        stimulus: current_stim
      });
      if (info.key == 70){
          currentkey = -1;
      }
      if (info.key == 74){
          currentkey = 1;
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
      allow_held_key: false
    });

    function endTrial() {

      jsPsych.pluginAPI.cancelKeyboardResponse(response_listener);

      var trial_data = {
        "animation_sequence": JSON.stringify(animation_sequence),
        "responses": JSON.stringify(responses)
      };

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
