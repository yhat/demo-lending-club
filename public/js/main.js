$(document).ready(function() {

  $.fn.serializeObject = function() {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
  };

  function makeChart(score) {
    var buckets = [100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400,1500];
    var obs = [1011,7157,12701,5260,2590,3098,0,0,0,0,0,0,0,37];
    var columns = [
      ['x'].concat(buckets),
      ['score'].concat(obs)
    ]

    if (score) {
      var actual = [];
      for(var i=0; i < buckets.length; i++) {
        var bucket = buckets[i]
        if (score < bucket) {
          actual.push(obs[i]);
          break
        } else if (i==buckets.length) {
          actual.push(obs[i]);
          break;
        }
        actual.push(null);
      }
      columns.push(['Applicant'].concat(actual));
    }

    var chart = c3.generate({
      bindto: '#chart-1',
      size: {
        height: 300,
        width: 500
      },
      padding: {
        top: 10
      },
      axis: {
        x: {
          label: 'Score'
        },
        y: {
          label: {
            text:'# of Observations',
            position: 'outer-middle'
          }
        }
      },
      data: {
        x: 'x',
        columns: columns,
        type: 'bar',
        types: {
          'Applicant': 'line'
        },
        colors: {
          score: '#428bca',
          Applicant: 'coral'
        },
      },
      point: {
        r: 5
      },
      bar: {
        width: {
        ratio: 0.9 // this makes bar width 50% of length between ticks
        }
      }
    });
  }

  function makeProbabilityChart(probability) {
    var buckets = [0,0.02,0.04,0.06,0.08,0.1,0.12,0.14,0.16,0.18,0.2,0.22,0.24,0.26,0.28,0.3,0.32,0.34,0.36];
    var obs = [24,18230,16798,10831,8196,6258,4688,2392,348,49,20,6,4,3,4,2,2,1];
    var columns = [
      ['x'].concat(buckets),
      ['probability'].concat(obs)
    ]

    if (probability) {
      var actual = [];
      for(var i=0; i < buckets.length; i++) {
        var bucket = buckets[i]
        if (probability < bucket) {
          actual.push(obs[i]);
          break
        } else if (i==buckets.length) {
          actual.push(obs[i]);
          break;
        }
        actual.push(null);
      }
      columns.push(['Applicant'].concat(actual));
    }

    var chart = c3.generate({
      bindto: '#chart-2',
      size: {
        height: 400,
        width: 500
      },
      padding: {
        top: 10
      },
      axis: {
        x: {
          label: 'Probability'
        },
        y: {
          label: {
            text:'# of Observations',
            position: 'outer-middle'
          }
        }
      },
      data: {
        x: 'x',
        columns: columns,
        type: 'bar',
        types: {
          'Applicant': 'line'
        },
        colors: {
          probability: '#428bca',
          Applicant: 'coral'
        },
      },
      point: {
        r: 5
      },
      bar: {
        width: {
        ratio: 0.9 // this makes bar width 50% of length between ticks
        }
      }
    });
  }

  $("#applicant").submit(function(e) {
    e.preventDefault();
    var data = $("#applicant").serializeObject();
    data.last_fico_range_low = parseInt(data.last_fico_range_low);
    data.last_fico_range_high = parseInt(data.last_fico_range_high);
    data.revol_util = parseInt(data.revol_util);
    data.inq_last_6mths = parseInt(data.inq_last_6mths);
    data.annual_inc = parseInt(data.annual_inc);
    data.loan_amnt = parseInt(data.loan_amnt);
    console.log(data)
    $.ajax({
      url: "/",
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(output) {
        console.log(output);
        var probability = output.result.prob_default;
        var score = output.result.score;

        if (score) {
          makeChart(score);
          $("#score-container").removeClass("hide");
        }
        if (probability) {
          makeProbabilityChart(probability)
          $("#prob-container").removeClass("hide");
        }
        $("#raw-output").text(JSON.stringify(output, null, 2));
      }
    });
    return false;
  });
  makeChart();
  // makeProbabilityChart();
});
