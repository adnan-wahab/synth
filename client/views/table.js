this.table = table
table.step = step
table.bpm =  150
table.msPerBeat = 60000 / table.bpm
table.class = 'source'

function table (el, data) {
  var w = Session.get('width') * .9
    , h = Session.get('height') * .9
    , rows = 16
    , size = ~~ (h / rows)
    , svg = el.append('svg').attr('width', w).attr('height', h)
    , item = { _id: Session.get('world')._id, index: 0 }
    , clicking = false
    , done, int


  data =
    256 == data.length ? data :
    d3.range(rows * rows).map(d3.functor(false))

  var rect = svg.selectAll('.table').data(data)
             .enter().append('rect')
             .attr('class', 'table')
             .attr('transform', translate)
             .attr('width', size)
             .attr('height', size)
             .attr('fill', 'steelblue')
             .attr('stroke', 'aliceblue')
             .on('click', mousedown)
             .call(d3.behavior.slide())

  int = setInterval(voice, table.msPerBeat, data)
  voice(data)

  var live = Graph.find({ _id: Session.get('world')._id }).observe({
    changed: function (doc) {
      d3.selectAll('.table').data(doc.state).attr('fill')
    }
  })

  return function () {
    clearInterval(int)
    saveTable()
    live.stop()
  }

  function translate (d, i) {
    return "translate(" + [250 + (i % rows) * size,
                           Math.floor(i / rows) * size] + ")";
  }

  function voice(d) {
    d3.selectAll('.table').attr('fill', fill)
    step(data, item)
    d3.selectAll('.table:nth-child(16n + ' + ~~ item.index + ')').attr('fill', fillVoice)
  }
}

function step(data, item) {
  var col = (item.index = (1 + item.index || 0) % 16)
  return data.filter ? data.filter(function (d, i) { return i % 16 == col && d }) : data //oh god
}

function fillVoice(d) {
  return d ? 'pink' : 'red'
}

function fill (d) {
  return d ? 'pink' : 'steelblue'
}

function mousedown(d) {
  d3.select(this).attr('fill', fill).datum(! d)
  saveTable()
}

d3.behavior.slide = function () {
  var clicking = false, init
  return function (selection) {
    selection
    .on('mousedown.slide', function (d) { this.__prevSelected = true, clicking = true, init = ! d })
    .on('mouseup.slide', function () {
      clicking = false,  d3.selectAll('.table').each(function () { this.__prevSelected = false })
    })
    .on('mousemove.slide', function (d, i) {
      if (clicking && ! this.__prevSelected)
        (this.__prevSelected = true) +
        d3.select(this).attr('fill', fill).datum(init) +
        saveTable()
    })
  }
}

function saveTable() {
  Graph.update({ _id: Session.get('world')._id },
               { $set: { state: d3.selectAll('.table').data() }
               })
}
