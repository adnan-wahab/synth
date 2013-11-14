Meteor.startup(function () {
  $('.dropdown').hide()
  var handle = Tracks.find().observe({
    added: function (doc) {
      Session.set('currentTrack', doc._id)
      handle.stop()
    }
  })
})

Template.trackList.events({
  'mouseover .track': _.compose(switchTracks, pluckWith('_id', true))

, 'click .track': function () {
    d3.select('.dropdown').classed('hidden', true)
  }

, 'click .add': function () {
    switchTracks(Tracks.insert({ title: 'No Title' }))
  }
})

Template.trackList.helpers({
  track: function () {
    var re = new RegExp(Session.get('filter') || '', 'i')
    return Tracks.find().fetch().filter(function (d) {
             return re.test(d.title)
           })
  }
, selected: function () {
    return Session.get('currentTrack') == this._id ? 'selected' : ''
  }
})

Template.header.events({
  'click .browse': function () {
    var showDropdown = Session.get('showDropdown')
    Session.set('showDropdown', ! showDropdown)
    d3.select('.dropdown').classed('hidden', showDropdown)
  }


, 'keyup .search': function (e) {
    Session.set('filter', e.target.value)
  }

, 'focus .search': function () {
    Session.set('showDropdown', true)
    d3.select('.dropdown').classed('hidden', false)
  }

, 'blur .search': function () {
    Session.set('filter', '')
    Session.set('showDropdown', false)
    d3.select('.dropdown').classed('hidden', true)
  }

, 'keypress .title': function (e) {
    if (e.which == 13) e.target.blur()
  }

, 'blur .title': function (e) {
    Tracks.update({ _id: Session.get('currentTrack') },
                  { title: e.target.textContent })
  }
})

Template.header.currentTitle = function () {
  return (Tracks.findOne({ _id: Session.get('currentTrack') })  || {}).title
}

function switchTracks(id) {
  var old = Session.get('currentTrack')
  if (old == id) return console.log(456)
  window.k && k.stop()
  k = Meteor.subscribe('allGraph', id, old)
  Session.set('currentTrack', id)
}